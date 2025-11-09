import React, { useState } from 'react';
import '../../../css/header.css';


export default function Header() {
  return (
<header>
    <div className="logo"><a href=""><img src="" alt="Ramil's Creation Logo" /></a></div>
    <nav>
        <ul class="nav-links">
        <li class="nav-item">
          <a href="#hero">Home <span class="arrow">&#9662;</span></a>
          <ul class="dropdown">
            <li>Wall-in Visit</li>
          </ul>
        </li>
        <li class="nav-item">
          <a href="#services">Packages<span class="arrow">&#9662;</span></a>
          <ul class="dropdown">
            <li>Wedding Package</li>
            <li>Debut Package</li>
          </ul>
        </li>
        <li class="nav-item">Calendar</li>
        
        <li id="signInButton">Sign In</li>
      </ul>
    </nav>
</header>
  );
}
