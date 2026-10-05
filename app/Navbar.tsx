import React from 'react'
import './Navbar.css'

type navbarProps = {
  links: { text: string; url: string }[]
}

const Navbar: React.FC<navbarProps> = ({ links }) => {
  return (
    <nav>
      <ul>
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.url}>{link.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar
