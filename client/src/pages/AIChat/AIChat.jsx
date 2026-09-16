import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { clearChatHistory, getChatHistory, sendChatMessage } from "../../services/chatService";
import "./AIChat.css";

const STARTERS = ["How can I improve my resume?", "Help me prepare for an interview", "Which skills should I learn next?", "How should I search for jobs?"];

function AIChat() {
  const [messages, setMessages] = useState([]); const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false); const endRef = useRef(null);
  useEffect(() => { getChatHistory().then((res) => setMessages(res.data)).catch(() => toast.error("Could not load chat history")).finally(() => setLoading(false)); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);
  const send = async (text = message) => {
    const content = text.trim(); if (!content || sending) return;
    setMessage(""); setSending(true); const optimistic = { _id: `pending-${Date.now()}`, role: "user", content }; setMessages((current) => [...current, optimistic]);
    try { const res = await sendChatMessage(content); setMessages((current) => [...current.filter((item) => item._id !== optimistic._id), res.data.userMessage, res.data.assistantMessage]); }
    catch (error) { setMessages((current) => current.filter((item) => item._id !== optimistic._id)); toast.error(error.response?.data?.message || "Message could not be sent"); }
    finally { setSending(false); }
  };
  const clear = async () => { if (!messages.length || !window.confirm("Clear this chat history?")) return; try { await clearChatHistory(); setMessages([]); toast.success("Chat history cleared"); } catch { toast.error("Could not clear chat history"); } };
  return <div className="ai-chat-page"><div className="ai-chat-header"><div><h1>AI Career Coach</h1><p>Ask about careers, skills, resumes, interviews, or job-search strategy.</p></div><Button variant="outline" size="sm" icon={<FaTrash />} onClick={clear} disabled={!messages.length}>Clear chat</Button></div><Card className="ai-chat-card">{loading ? <Loader label="Loading your conversation..." /> : <><div className="ai-chat-messages">{!messages.length && <div className="ai-chat-welcome"><div className="ai-chat-avatar">AI</div><h2>How can I help with your career?</h2><p>I use your profile when it is available, so the advice can stay relevant to your goals.</p><div className="ai-chat-starters">{STARTERS.map((item) => <button key={item} onClick={() => send(item)}>{item}</button>)}</div></div>}{messages.map((item) => <div className={`ai-chat-message ai-chat-message--${item.role}`} key={item._id}><span>{item.role === "assistant" ? "AI" : "You"}</span><p>{item.content}</p></div>)}{sending && <div className="ai-chat-message ai-chat-message--assistant"><span>AI</span><p className="ai-chat-typing">Thinking…</p></div>}<div ref={endRef} /></div><form className="ai-chat-compose" onSubmit={(event) => { event.preventDefault(); send(); }}><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask your career question…" maxLength={4000} rows={2} /><Button type="submit" icon={<FaPaperPlane />} loading={sending} disabled={!message.trim()}>Send</Button></form></>}</Card></div>;
}
export default AIChat;
