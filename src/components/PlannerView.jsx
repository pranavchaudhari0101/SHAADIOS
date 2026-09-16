import React, { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  Send,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { queryPlanner } from '../core/actionEngine.js'
import { calculateHealthScore, detectRisks } from '../core/riskEngine.js'

export function PlannerView({
  wedding,
  tasks = [],
  vendors = [],
  people = [],
  onTask,
}) {
  const [prompt, setPrompt] = useState('')
  const [currentResponse, setCurrentResponse] = useState(null)

  const risks = detectRisks({ wedding, tasks, vendors })
  const health = calculateHealthScore(tasks, risks)
  const openTasks = tasks.filter((t) => t.status !== 'Done')

  const handleAsk = (queryText) => {
    const q = (queryText || prompt).trim()
    if (!q) return

    const result = queryPlanner(q, { wedding, tasks, vendors, people })
    setCurrentResponse({
      query: q,
      answer: result.answer,
      actionTaskId: result.actionTaskId,
      actionLabel: result.actionLabel,
    })
    setPrompt('')
  }

  const sampleQuestions = [
    'What should I do this week?',
    'What does a date change affect?',
    'Who is waiting on what?',
    'What are my biggest risks right now?',
    'How is my budget looking?',
  ]

  return (
    <div className="page planner-page">
      <div className="planner-hero">
        <div>
          <span className="planner-orb">
            <Sparkles size={24} />
          </span>
          <p className="eyebrow">YOUR CONTEXT-AWARE COORDINATOR</p>
          <h1>
            Ask about your wedding,<br />
            <em>not a blank chat.</em>
          </h1>
          <p>
            I already know your {wedding.city} dates, ceremonies, vendor holds, who is waiting, and what is blocked.
            Ask me for guidance and I will surface the shortest path.
          </p>
        </div>

        <div className="planner-context">
          <p>LIVE STATE SNAPSHOT</p>
          <span>
            <CheckCircle2 size={16} /> {health.score}% on track
          </span>
          <span>
            <CircleAlert size={16} /> {risks.length} risk{risks.length === 1 ? '' : 's'} watched
          </span>
          <span>
            <UsersRound size={16} /> {people.length} collaborators
          </span>
        </div>
      </div>

      <section className="planner-workspace">
        <div className="suggested-prompts">
          <p>PROVEN QUESTIONS</p>
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setPrompt(q)
                handleAsk(q)
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="chat-area">
          {currentResponse ? (
            <div className="planner-answer">
              <span className="assistant-avatar">
                <Sparkles size={17} />
              </span>
              <div>
                <p className="assistant-name">ShaadiOS AI Coordinator</p>
                <div className="answer-text">
                  {currentResponse.answer.split('\n\n').map((para, i) => (
                    <p key={i}>
                      {para.split('**').map((chunk, j) =>
                        j % 2 === 1 ? <strong key={j}>{chunk}</strong> : chunk
                      )}
                    </p>
                  ))}
                </div>

                <div className="answer-actions">
                  {currentResponse.actionTaskId && (
                    <button
                      className="primary-button compact"
                      onClick={() => {
                        const target = tasks.find((t) => t.id === currentResponse.actionTaskId)
                        if (target) onTask(target)
                      }}
                    >
                      {currentResponse.actionLabel || 'Open connected task'} <ArrowRight size={14} />
                    </button>
                  )}
                  <button
                    className="secondary-button compact"
                    onClick={() => setCurrentResponse(null)}
                  >
                    Ask another question
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-empty">
              <span><Sparkles size={22} /></span>
              <h2>What would make your wedding feel lighter today?</h2>
              <p>Pick a question above or type anything about dates, budgets, or family delegation.</p>
            </div>
          )}

          <div className="planner-input">
            <label className="sr-only" htmlFor="planner-question">
              Ask ShaadiOS coordinator
            </label>
            <input
              id="planner-question"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask about a decision, a vendor, a deadline, or a change…"
            />
            <button
              disabled={!prompt.trim()}
              onClick={() => handleAsk()}
              aria-label="Send question"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </section>

      <p className="planner-safety">
        <LockKeyhole size={15} /> Safety Guarantee: The coordinator will never finalize contracts or incur expenses without your review.
      </p>
    </div>
  )
}
