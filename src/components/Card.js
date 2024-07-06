// src/components/Card.js
import React from 'react';

const Card = ({ suit, rank }) => {
  console.log(`Rendering card: ${rank} of ${suit}`);
  return (
    <div className="card">
      {rank} of {suit}
    </div>
  );
};

export default Card;
