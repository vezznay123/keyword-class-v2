import React from 'react';
import Tooltip from './Tooltip';

const QueryClassifier = () => {
  return (
    <div>
      <div className="heading-container">
        <h2>Query Type</h2>
        <Tooltip text="Classifies the type of query being made. Example: 'SELECT * FROM users' would be classified as a 'SELECT' query type." />
      </div>

      <div className="heading-container">
        <h2>Tables Accessed</h2>
        <Tooltip text="Lists all tables referenced in the query. Example: For 'SELECT * FROM users JOIN orders', it would show 'users, orders'" />
      </div>

      <div className="heading-container">
        <h2>Columns Referenced</h2>
        <Tooltip text="Shows all columns mentioned in the query. Example: For 'SELECT name, email FROM users', it would show 'name, email'" />
      </div>

      <div className="heading-container">
        <h2>Where Conditions</h2>
        <Tooltip text="Displays the filtering conditions used. Example: For 'SELECT * FROM users WHERE age > 18', it would show 'age > 18'" />
      </div>
    </div>
  );
};

export default QueryClassifier;