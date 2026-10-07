import React from 'react'

/**
 * Skiper40 - Animated CSS Links & Interactions
 * Inspired by Skiper UI & modern craft interactions (Cursor, Linear)
 */

export function Link000({ children, href, onClick, className = '', ...props }) {
  const Comp = href ? 'a' : 'button'
  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`skiper-link skiper-link-000 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function Link001({ children, href, onClick, className = '', ...props }) {
  const Comp = href ? 'a' : 'button'
  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`skiper-link skiper-link-001 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="skiper-arrow"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Comp>
  )
}

export function Link002({ children, href, onClick, className = '', ...props }) {
  const Comp = href ? 'a' : 'button'
  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`skiper-link skiper-link-002 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="skiper-arrow"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Comp>
  )
}

export function Link003({ children, href, onClick, className = '', ...props }) {
  const Comp = href ? 'a' : 'button'
  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`skiper-link skiper-link-003 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="skiper-arrow"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Comp>
  )
}

export function Link004({ children, href, onClick, className = '', ...props }) {
  const Comp = href ? 'a' : 'button'
  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`skiper-link skiper-link-004 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="skiper-arrow"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Comp>
  )
}

export function Link005({ children, href, onClick, className = '', ...props }) {
  const Comp = href ? 'a' : 'button'
  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`skiper-link skiper-link-005 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="skiper-arrow"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Comp>
  )
}

export default { Link000, Link001, Link002, Link003, Link004, Link005 }
