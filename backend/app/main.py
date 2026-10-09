"""SignConnect AI - signaling + text relay server (no video ever touches this server)."""
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SignConnect AI Signaling")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MAX_PEERS = 2
rooms: dict = {}  # room_id -> {peer_id: {"ws": WebSocket, "name": str}}


@app.get("/api/health")
def health():
    return {"status": "ok", "rooms": len(rooms)}


@app.get("/api/rooms/{rid}")
def room_info(rid: str):
    r = rooms.get(rid.upper())
    return {"exists": r is not None, "count": len(r) if r else 0, "full": bool(r) and len(r) >= MAX_PEERS}


async def fail(ws: WebSocket, code: str, message: str):
    await ws.send_json({"type": "error", "code": code, "message": message})
    await ws.close(code=1008)


@app.websocket("/ws/{rid}/{pid}")
async def signaling(ws: WebSocket, rid: str, pid: str, name: str = "Guest", create: int = 0):
    rid = rid.upper()
    await ws.accept()
    room = rooms.get(rid)
    if room is None and not create:
        return await fail(ws, "invalid_room", "Room not found. Check the Room ID.")
    if room is None:
        room = rooms[rid] = {}
    if len(room) >= MAX_PEERS:
        return await fail(ws, "room_full", "This room is full (max 2 people).")
    name = name[:30]
    room[pid] = {"ws": ws, "name": name}
    for oid, p in list(room.items()):
        if oid != pid:
            await p["ws"].send_json({"type": "peer-joined", "from": pid, "name": name})
    try:
        while True:
            data = await ws.receive_json()
            data["from"], data["name"] = pid, name
            for oid, p in list(room.items()):
                if oid != pid:
                    await p["ws"].send_json(data)
    except Exception:
        pass
    finally:
        room.pop(pid, None)
        for p in list(room.values()):
            try:
                await p["ws"].send_json({"type": "peer-left", "from": pid})
            except Exception:
                pass
        if not room:
            rooms.pop(rid, None)
