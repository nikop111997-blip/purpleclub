"use client";

import { useEffect, useRef, useState } from "react";

const FAQS = [
  {
    q: "Do I need to be fit?",
    a: "Not at all! 💜 You don't need to arrive at any particular fitness level. Your host explains every activity and easier options. Check the event page for venue-specific details.",
  },
  {
    q: "Can I come alone?",
    a: "Absolutely! 😊 Lots of people come solo. Tell your host it's your first time, and we'll help you feel welcome and introduce you to the group.",
  },
  {
    q: "What should I bring?",
    a: "Keep it simple! 👟 Wear comfortable clothes and suitable shoes, and bring water. Your booking confirmation will mention anything else you need.",
  },
  {
    q: "Is my first visit really free?",
    a: "Yes! 🎉 Your first eligible Purple Sunday is complimentary. The event page explains exactly what's included before you book.",
  },
  {
    q: "What happens afterwards?",
    a: "No pressure at all! 💜 If you enjoy your Sunday with us, you can book another experience or explore membership. It's completely up to you.",
  },
  {
    q: "Can children join?",
    a: "It depends on the event. Each event page explains the age requirements and whether a parent or guardian needs to attend.",
  },
  {
    q: "What if the weather turns?",
    a: "If the weather affects an event, your host will message everyone who booked. Check the event page for the venue's weather policy.",
  },
  {
    q: "Where does Purple Club run?",
    a: "We're growing city by city! 📍 Choose your city to see confirmed events, or message us with the city where you'd love to see Purple Club next.",
  },
];

function HostAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#d4ff3f] shadow-sm">
      <img src="/main.png" alt="Purple Club host" className="h-full w-full object-contain" />
    </div>
  );
}

export default function FaqSection({ session }) {
  const [messages, setMessages] = useState([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [typingId, setTypingId] = useState(null);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!typingId) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setTypingId(null);
      return;
    }
    timerRef.current = window.setTimeout(() => setTypingId(null), 550);
    return () => window.clearTimeout(timerRef.current);
  }, [typingId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typingId]);

  const askQuestion = (question, answer) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setMessages((previous) => [...previous, { id, question, answer }]);
    setTypingId(id);
  };

  const selectFaq = (index) => {
    askQuestion(FAQS[index].q, FAQS[index].a);
  };

  const sendCustomQuestion = (event) => {
    event.preventDefault();
    const question = customQuestion.trim();
    if (!question) return;

    askQuestion(
      question,
      "Thanks for reaching out! 💜 For a personalised answer, email hello@purpleclub.com and our team will help you out."
    );
    setCustomQuestion("");
  };

  return (
    <>
      <style>{`
        @keyframes faqPopIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes faqTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: .35; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .faq-pop-in { animation: faqPopIn .28s ease-out both; }
        .faq-typing-dot { animation: faqTyping 1s infinite ease-in-out; }
        .faq-chat-scroll { scrollbar-width: thin; scrollbar-color: #c8b7dc transparent; }
        @media (prefers-reduced-motion: reduce) {
          .faq-pop-in, .faq-typing-dot { animation: none !important; }
        }
      `}</style>

      <section
        id="faq"
        className="relative overflow-hidden bg-[#d4ff3f] px-4 py-16 font-sans text-[#21172b] sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d4ff3f]/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#6b3fa0]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Intro */}
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <div className="mb-5 inline-flex items-center gap-2 border-b-1  px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#6b3fa0]">
              <span className="h-2 w-2 rounded-full bg-[#6b3fa0]" />
              Your Purple Club guide
            </div>

            <h2 className="max-w-lg text-4xl font-bold leading-[1.03] tracking-[-.045em] sm:text-5xl lg:text-5xl">
              Curious about
              <span className="mt-1 block text-[#6b3fa0]">your first Sunday?</span>
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-[#62586b] sm:text-lg">
              New experiences can bring a few questions. Chat with your Sunday
              host, find quick answers, and feel good about showing up.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["Come as you are", "No pressure", "Good people"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#6b3fa0]/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#554667] shadow-sm"
                >
                  <span className="mr-1.5 text-[#6b3fa0]">✦</span>
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 hidden items-center gap-3 lg:flex">
              <div className="flex -space-x-2">
                <HostAvatar />
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#f7f4fa] bg-[#d4ff3f] text-sm font-bold text-[#21172b]">
                  +
                </div>
              </div>
              <p className="text-sm leading-5 text-[#62586b]">
                Friendly people. Fresh air.
                <br />
                Just a better kind of Sunday.
              </p>
            </div>
          </div>

          {/* FAQ chat */}
          <div className="mx-auto w-full max-w-2xl min-w-0">
            <div className="overflow-hidden rounded-[1.75rem] border border-[#6b3fa0]/10 bg-white shadow-[0_24px_80px_rgba(45,25,65,0.14)]">
              {/* Header */}
              <div className="relative overflow-hidden bg-[#6b3fa0] px-5 py-5 text-white sm:px-6">
                <div className="pointer-events-none absolute -right-5 -top-12 h-32 w-32 rounded-full border-[18px] border-white/[0.07]" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-1.5">
                      <img src="/light.png" alt="Purple Club" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold tracking-tight">Purple Club host</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/75">
                        <span className="h-2 w-2 rounded-full bg-[#d4ff3f]" />
                        Here to help you feel at home
                      </p>
                    </div>
                  </div>
                  <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] sm:inline-flex">
                    FAQ chat
                  </span>
                </div>
              </div>

              {/* Conversation */}
              <div className="faq-chat-scroll h-[420px] overflow-y-auto bg-[#fbf9fd] px-4 py-5 sm:h-[470px] sm:px-6 sm:py-6">
                <div className="mb-6 text-center">
                  <span className="rounded-full bg-[#eee8f5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#83758f]">
                    Your Sunday starts here
                  </span>
                </div>

                <div className="faq-pop-in mb-6 flex items-end gap-2.5">
                  <HostAvatar />
                  <div className="max-w-[88%]">
                    <p className="mb-1.5 ml-1 text-[11px] font-bold text-[#82758d]">Your host</p>
                    <div className="rounded-2xl rounded-bl-md border border-[#eee8f4] bg-white px-4 py-3.5 text-sm leading-6 text-[#3b3046] shadow-[0_4px_16px_rgba(40,20,60,.04)]">
                      Hey there! Welcome to Purple Club.
                      <br />
                      Ask me anything about your first Sunday, or tap a question below to get started. 
                    </div>
                  </div>
                </div>

                {/* Questions live inside the chat */}
                <div className="mb-6 ml-0 sm:ml-11">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#8a7b96]">
                    Popular questions
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {FAQS.map((faq, index) => (
                      <button
                        key={faq.q}
                        type="button"
                        onClick={() => selectFaq(index)}
                        className="group flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[#e9e1f0] bg-white px-3.5 py-3 text-left text-xs font-semibold text-[#443650] transition duration-200 hover:-translate-y-0.5 hover:border-[#6b3fa0]/40 hover:bg-[#f4eff9] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3fa0]"
                      >
                        <span>{faq.q}</span>
                        <span className="shrink-0 text-base text-[#6b3fa0] transition-transform group-hover:translate-x-0.5">↗</span>
                      </button>
                    ))}
                  </div>
                </div>

                {messages.length > 0 && (
                  <div className="flex flex-col gap-5">
                    {messages.map((message) => (
                      <div key={message.id} className="flex flex-col gap-4">
                        <div className="faq-pop-in flex justify-end">
                          <div className="max-w-[88%]">
                            <div className="rounded-2xl rounded-br-md bg-[#6b3fa0] px-4 py-3 text-sm leading-6 text-white shadow-sm">
                              {message.question}
                            </div>
                            <p className="mt-1.5 text-right text-[10px] text-[#9b91a5]">You · Sent</p>
                          </div>
                        </div>

                        {typingId === message.id ? (
                          <div className="flex items-end gap-2.5">
                            <HostAvatar />
                            <div>
                              <p className="mb-1.5 ml-1 text-[11px] font-bold text-[#82758d]">Your host is typing</p>
                              <div role="status" aria-label="Purple Club host is typing" className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#eee8f4] bg-white px-4 py-4 shadow-sm">
                                {[0, 1, 2].map((dot) => (
                                  <span key={dot} className="faq-typing-dot h-2 w-2 rounded-full bg-[#6b3fa0]" style={{ animationDelay: `${dot * 0.15}s` }} />
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="faq-pop-in flex items-end gap-2.5">
                            <HostAvatar />
                            <div className="max-w-[90%]">
                              <p className="mb-1.5 ml-1 text-[11px] font-bold text-[#82758d]">Your host</p>
                              <div className="rounded-2xl rounded-bl-md border border-[#eee8f4] bg-white px-4 py-3.5 text-sm leading-6 text-[#3b3046] shadow-[0_4px_16px_rgba(40,20,60,.04)]">
                                {message.answer}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Ask a question */}
              <form onSubmit={sendCustomQuestion} className="border-t border-[#eee8f4] bg-white p-3.5 sm:p-4">
                <div className="flex items-center gap-2 rounded-full border border-[#e6deed] bg-[#faf8fc] p-1.5 pl-4 transition focus-within:border-[#6b3fa0]/50 focus-within:ring-4 focus-within:ring-[#6b3fa0]/[0.08]">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(event) => setCustomQuestion(event.target.value)}
                    placeholder="Type your question..."
                    aria-label="Ask Purple Club a question"
                    maxLength={300}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#21172b] outline-none placeholder:text-[#a49aaa]"
                  />
                  <button
                    type="submit"
                    disabled={!customQuestion.trim()}
                    aria-label="Send message"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6b3fa0] text-white transition hover:bg-[#57308a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3fa0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 2 11 13" />
                      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2.5 text-center text-[10px] text-[#a49aaa]">
                  Good questions. Friendly answers. Always 💜
                </p>
              </form>
            </div>
            <p className="mt-4 text-center text-xs text-[#82758d]">
              Tap a popular question or send us your own.
            </p>
          </div>
        </div>
      </section>

      {/* Final invitation */}
      <section
        id="book"
        className="bg-[#6b3fa0] px-5 py-20 text-center font-sans text-white sm:px-8 sm:py-24 lg:py-28"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <p className="mb-5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-[#d4ff3f]">
            Your next chapter starts here
          </p>
          <h2 className="text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
            Ready to come alive?
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-xl">
            Your next good memory could start this Sunday. Come as you are,
            and we'll meet you there.
          </p>
          <a
            href={session ? "/dashboard" : "/#membership"}
            className="mt-9 inline-flex items-center justify-center rounded-full bg-[#d4ff3f] px-8 py-3.5 text-base font-semibold text-[#17131c] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-lg"
          >
            Book My First Sunday <span className="ml-3 text-xl" aria-hidden="true">↗</span>
          </a>
          <p className="mt-3 text-sm text-white/75">Your first experience is on us.</p>
          <div className="mt-8 flex items-center gap-4 text-white/60" aria-hidden="true">
            <span className="h-px w-12 bg-white/30" />
            <span className="text-xs font-semibold tracking-[.2em]">OR</span>
            <span className="h-px w-12 bg-white/30" />
          </div>
          <a
            href="https://chat.whatsapp.com/your-community-link"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 text-base font-medium underline decoration-[#d4ff3f] decoration-2 underline-offset-4 transition hover:text-[#d4ff3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-lg"
          >
            Join the Purple WhatsApp community
          </a>
        </div>
      </section>
    </>
  );
}
