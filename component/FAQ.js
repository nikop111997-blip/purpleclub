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

function HostAvatar({ small = false }) {
  return (
   <img src="/main.png" className="h-10" />
  );
}

export default function FaqSection({session}) {
  const [messages, setMessages] = useState([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [typingId, setTypingId] = useState(null);
  const [mobileFaqOpen, setMobileFaqOpen] = useState(false);

  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!typingId) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setTypingId(null);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setTypingId(null);
    }, 650);

    return () => window.clearTimeout(timerRef.current);
  }, [typingId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, typingId]);

  const selectFaq = (index) => {
    const id = `${Date.now()}-${index}`;

    setMobileFaqOpen(false);
    setMessages((previous) => [
      ...previous,
      {
        id,
        question: FAQS[index].q,
        answer: FAQS[index].a,
      },
    ]);
    setTypingId(id);
  };

  const sendCustomQuestion = (event) => {
    event.preventDefault();

    const question = customQuestion.trim();
    if (!question) return;

    const id = `${Date.now()}-custom`;

    setMessages((previous) => [
      ...previous,
      {
        id,
        question,
        answer:
          "Thanks for reaching out! 💜 For a personalised answer, email hello@purpleclub.com and our team will help you out.",
      },
    ]);

    setCustomQuestion("");
    setTypingId(id);
  };

  return (
    <>
      <style>{`
        @keyframes chatMessageIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chatTyping {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: .4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        .chat-message-in {
          animation: chatMessageIn .3s ease-out both;
        }

        .chat-typing-dot {
          animation: chatTyping 1s infinite ease-in-out;
        }

        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c7b3db transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-message-in,
          .chat-typing-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* FAQ SECTION (entire section is lime) */}
      <section
        id="faq"
        className="relative isolate overflow-clip bg-[#d4ff3f] px-5 py-16 font-sans text-[#17131c] sm:px-8 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">

          {/* LEFT COLUMN */}
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-8 lg:self-start">

            <div>
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#6b3fa0]">
                <span className="h-2 w-2 rounded-full bg-[#6b3fa0]" />
                YOUR PURPLE CLUB GUIDE
              </div>

              <h2 className="max-w-lg text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
                Got questions?
                <span className="mt-1 block text-[#6b3fa0]">
                  Let's chat.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-[#3d3745] sm:text-lg">
                First Sunday jitters? We get it. Ask us anything and get to
                know what your first Purple Club experience looks like.
              </p>
            </div>

            {/* Desktop quick questions */}
            <div className="hidden lg:block">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#4a4452]">
                QUICK QUESTIONS
              </p>

              <div className="flex flex-col gap-1">
                {FAQS.map((faq, index) => (
                  <button
                    key={faq.q}
                    type="button"
                    onClick={() => selectFaq(index)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition hover:bg-white/60"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg text-[#6b3fa0] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile quick questions */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFaqOpen((current) => !current)}
                aria-expanded={mobileFaqOpen}
                className="flex w-full items-center justify-between rounded-2xl border border-[#6b3fa0]/15 bg-white px-4 py-4 text-left text-sm font-semibold shadow-sm"
              >
                {mobileFaqOpen
                  ? "Choose a question"
                  : "Browse common questions"}
                <span className="text-xl text-[#6b3fa0]">
                  {mobileFaqOpen ? "−" : "+"}
                </span>
              </button>

              {mobileFaqOpen && (
                <div className="mt-2 flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-2">
                  {FAQS.map((faq, index) => (
                    <button
                      key={faq.q}
                      type="button"
                      onClick={() => selectFaq(index)}
                      className="rounded-xl px-3 py-3 text-left text-sm transition hover:bg-[#f4eff9]"
                    >
                      {faq.q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex -space-x-2">
                <HostAvatar />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d4ff3f] bg-white text-sm font-bold">
                  +
                </div>
              </div>
              <p className="max-w-xs text-sm leading-5 text-[#3d3745]">
                Friendly people. No pressure. Just good Sundays.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY CHAT */}
          <div className="relative min-w-0 lg:sticky lg:top-26 lg:self-start">

            <div className="overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-white shadow-[0_20px_60px_rgba(35,18,52,0.18)]">

              {/* Chat Header */}
              <div className="flex items-center justify-between bg-[#6b3fa0] px-4 py-4 text-white sm:px-6">
                <div className="flex min-w-0 items-center gap-3">

                  <div className="min-w-0">
                    <img src="/light.png" className="h-8" alt=""/>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d4ff3f]" />
                      Your Sunday host · Here to help
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider sm:block">
                  FAQ CHAT
                </span>
              </div>

              {/* Scrollable Conversation */}
              <div className="chat-scroll h-[380px] overflow-y-auto bg-[#f8f6fa] px-4 py-5 sm:h-[440px] sm:px-6 lg:h-[min(58vh,560px)] lg:min-h-[380px]">

                <div className="mb-6 flex justify-center">
                  <span className="rounded-full bg-[#eee9f3] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#82788b]">
                    YOUR PURPLE CLUB GUIDE
                  </span>
                </div>

                {/* Welcome Message */}
                <div className="chat-message-in mb-6 flex items-end gap-2">
                  <HostAvatar small />
                  <div className="max-w-[90%]">
                    <p className="mb-1 ml-1 text-[11px] font-semibold text-[#82788b]">
                      Purple Club host
                    </p>
                    <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3.5 text-sm leading-6 text-[#342d3c] shadow-sm">
                      Hey there! 👋 Welcome to Purple Club.
                      <br />
                      <br />
                      Wondering what your first Sunday will be like? Pick a
                      question and let's make things easy. 💜
                    </div>
                    <p className="mt-1 px-1 text-[10px] text-[#99919f]">
                      Purple Club · Welcome
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex flex-col gap-5">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-4">

                      {/* Visitor Question */}
                      <div className="chat-message-in flex justify-end">
                        <div className="max-w-[88%]">
                          <div className="rounded-2xl rounded-br-sm bg-[#6b3fa0] px-4 py-3 text-sm leading-6 text-white shadow-sm">
                            {message.question}
                          </div>
                          <p className="mt-1 text-right text-[10px] text-[#99919f]">
                            You · Sent
                          </p>
                        </div>
                      </div>

                      {/* Host Typing */}
                      {typingId === message.id ? (
                        <div className="flex items-end gap-2">
                          <HostAvatar small />
                          <div>
                            <p className="mb-1 ml-1 text-[11px] font-semibold text-[#82788b]">
                              Purple Club host
                            </p>
                            <div
                              role="status"
                              aria-label="Purple Club host is typing"
                              className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-4 py-4 shadow-sm"
                            >
                              <span className="chat-typing-dot h-2 w-2 rounded-full bg-[#6b3fa0]" />
                              <span
                                className="chat-typing-dot h-2 w-2 rounded-full bg-[#6b3fa0]"
                                style={{ animationDelay: "0.15s" }}
                              />
                              <span
                                className="chat-typing-dot h-2 w-2 rounded-full bg-[#6b3fa0]"
                                style={{ animationDelay: "0.3s" }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="chat-message-in flex items-end gap-2">
                          <HostAvatar small />
                          <div className="max-w-[90%]">
                            <p className="mb-1 ml-1 text-[11px] font-semibold text-[#82788b]">
                              Purple Club host
                            </p>
                            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3.5 text-sm leading-6 text-[#342d3c] shadow-sm">
                              {message.answer}
                            </div>
                            <p className="mt-1 px-1 text-[10px] text-[#99919f]">
                              Purple Club · Reply
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendCustomQuestion}
                className="border-t border-black/[0.06] bg-white p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 rounded-full border border-[#e7e1ec] bg-[#faf9fb] p-1.5 pl-4 transition focus-within:border-[#6b3fa0]/50 focus-within:ring-2 focus-within:ring-[#6b3fa0]/10">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(event) =>
                      setCustomQuestion(event.target.value)
                    }
                    placeholder="Ask us something..."
                    aria-label="Ask Purple Club a question"
                    maxLength={300}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#17131c] outline-none placeholder:text-[#a49ba9]"
                  />

                  <button
                    type="submit"
                    disabled={!customQuestion.trim()}
                    aria-label="Send message"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6b3fa0] text-white transition hover:bg-[#57308a] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 2 11 13" />
                      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                    </svg>
                  </button>
                </div>

                <p className="mt-2 text-center text-[10px] text-[#a49ba9]">
                  Good questions. Friendly answers. Always 💜
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL INVITATION */}
      <section
        id="book"
        className="bg-[#6b3fa0] px-5 py-20 text-center font-sans text-white sm:px-8 sm:py-24 lg:py-32"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <p className="mb-5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d4ff3f]">
            YOUR NEXT CHAPTER STARTS HERE
          </p>

          <h2 className="text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
            Ready to come alive?
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-xl">
            Your next good memory could start this Sunday. Come as you are,
            and we'll meet you there.
          </p>

          <a
            href={`${session?'/dashboard':'/auth'}`}
            className="mt-9 inline-flex items-center justify-center rounded-full bg-[#d4ff3f] px-8 py-3 text-base font-semibold text-[#17131c] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-lg"
          >
            Book My First Sunday
            <span className="ml-3 text-xl" aria-hidden="true">
              ↗
            </span>
          </a>

          <p className="mt-3 text-sm text-white/75">
            Your first experience is on us.
          </p>

          <div className="mt-8 flex items-center gap-4 text-white/60" aria-hidden="true">
            <span className="h-px w-12 bg-white/30" />
            <span className="text-xs font-semibold tracking-[0.2em]">
              OR
            </span>
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