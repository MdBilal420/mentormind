from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.chat_models import ChatRequest, ChatResponse
from services.chat_service import ChatService
from utils.text_utils import truncate_transcript
import json

router = APIRouter(prefix="/api", tags=["chat"])

chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_tutor(request: ChatRequest):
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
        if not request.messages or len(request.messages) == 0:
            raise HTTPException(status_code=400, detail="At least one message is required")
        formatted_messages = [
            {"role": "system", "content": chat_service.get_socratic_system_prompt()},
            {"role": "system", "content": f"The following is the transcript of a lecture that the student wants to discuss:\n\n{truncate_transcript(request.transcript, 8000)}"}
        ]
        for msg in request.messages:
            formatted_messages.append({"role": msg.role, "content": msg.content})
        response = chat_service.generate_socratic_response(formatted_messages)
        return {"message": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@router.post("/chat-stream")
async def chat_with_tutor_stream(request: ChatRequest):
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
        if not request.messages or len(request.messages) == 0:
            raise HTTPException(status_code=400, detail="At least one message is required")
        system_prompt = chat_service.get_socratic_system_prompt()
        formatted_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"The following is the transcript of a lecture that the student wants to discuss:\n\n{truncate_transcript(request.transcript, 8000)}"}
        ]
        for msg in request.messages:
            formatted_messages.append({"role": msg.role, "content": msg.content})
        return StreamingResponse(
            chat_service.generate_streaming_response(formatted_messages),
            media_type="text/event-stream"
        )
    except Exception as e:
        error_json = json.dumps({"error": str(e)})
        async def error_stream():
            yield f"data: {error_json}\n\n"
        return StreamingResponse(error_stream(), media_type="text/event-stream")

@router.post("/chat-direct", response_model=ChatResponse)
async def chat_with_direct_answers(request: ChatRequest):
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
        if not request.messages or len(request.messages) == 0:
            raise HTTPException(status_code=400, detail="At least one message is required")
        formatted_messages = [
            {"role": "system", "content": chat_service.get_direct_system_prompt()},
            {"role": "system", "content": f"The following is the transcript of a lecture that the user is asking about:\n\n{truncate_transcript(request.transcript, 8000)}"}
        ]
        for msg in request.messages:
            formatted_messages.append({"role": msg.role, "content": msg.content})
        response = chat_service.generate_direct_response(formatted_messages)
        return {"message": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@router.post("/chat-direct-stream")
async def chat_with_direct_stream(request: ChatRequest):
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
        if not request.messages or len(request.messages) == 0:
            raise HTTPException(status_code=400, detail="At least one message is required")
        system_prompt = chat_service.get_direct_system_prompt()
        formatted_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"The following is the transcript of a lecture that the user is asking about:\n\n{truncate_transcript(request.transcript, 8000)}"}
        ]
        for msg in request.messages:
            formatted_messages.append({"role": msg.role, "content": msg.content})
        return StreamingResponse(
            chat_service.generate_streaming_response(formatted_messages),
            media_type="text/event-stream"
        )
    except Exception as e:
        error_json = json.dumps({"error": str(e)})
        async def error_stream():
            yield f"data: {error_json}\n\n"
        return StreamingResponse(error_stream(), media_type="text/event-stream") 