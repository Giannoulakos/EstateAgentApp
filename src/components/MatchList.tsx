import React from 'react';
import { Match } from '../types/property';

interface MatchListProps {
  matches: Match[];
  onClear: () => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, onClear }) => {
  if (matches.length === 0) return null;

  return (
    <div className='matches-section'>
      <div className='matches-header'>
        <h4>Potential Buyers ({matches.length})</h4>
        <button onClick={onClear} className='clear-matches-btn'>
          Clear
        </button>
      </div>

      <div className='matches-list'>
        {matches.map((match, index) => (
          <div key={index} className='match-card'>
            <div className='match-header'>
              <strong>{match.customer_name}</strong>
              <span className='similarity-score'>
                {Math.round(match.similarity_score * 100)}% match
              </span>
            </div>

            <div className='match-details'>
              <p>
                <strong>Phone:</strong> {match.customer_phone}
              </p>
              <p>
                <strong>Profile:</strong> {match.customer_profile}
              </p>
            </div>

            <div className='match-analysis'>
              <p>
                <strong>Analysis:</strong> {match.match_analysis}
              </p>
            </div>

            <div className='personalized-pitch'>
              <p>
                <strong>Pitch:</strong> {match.personalized_pitch}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchList;
