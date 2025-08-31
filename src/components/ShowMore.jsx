import React, { useState } from 'react';

export default function ShowMore({ items = [], initial = 3, renderItem }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, initial);

  return (
    <div className="showmore">
      <div className="showmore-items">
        {shown.map((it, i) => (
          <div key={i} className="showmore-item">
            {renderItem ? renderItem(it, i) : it}
          </div>
        ))}
      </div>
      {items.length > initial && (
        <button className="btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : `Show ${items.length - initial} more`}
        </button>
      )}
    </div>
  );
}

