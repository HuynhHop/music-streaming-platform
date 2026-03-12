import React, { useState } from 'react';

const AddFavoritesForm = ({ setIsAddingFavorite }) => {
  const accessToken = localStorage.getItem('accessToken'); // Fetch the token
  const storedUserData = JSON.parse(localStorage.getItem('userdata')); // Fetch user data
  const creatorId = storedUserData?._id || ''; // Get creator ID from user data

  // State to manage the new favorite data (only title)
  const [newFavorite, setNewFavorite] = useState({
    title: '',
  });

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input change for title
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFavorite((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding the favorite
  const handleAddFavorite = async () => {
    if (!newFavorite.title.trim()) {
      alert('Please enter a title for the favorite!');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Send the POST request to the backend
      const response = await fetch(
        `http://localhost:5000/api/favorites/creator/${creatorId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: newFavorite.title, // Only sending title to backend
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create favorite');
      }

      const result = await response.json();
      console.log('Favorite created:', result);
      alert('Favorite created successfully!');
      setIsAddingFavorite(false); // Close the form after adding
    } catch (err) {
      console.error('Error creating favorite:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h4 style={styles.header}>Add New Favorite</h4>
      <input
        type="text"
        name="title"
        value={newFavorite.title}
        placeholder="Enter title"
        onChange={handleChange}
        style={styles.input}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error */}

      <div style={styles.buttonContainer}>
        <button
          onClick={handleAddFavorite}
          style={styles.addButton}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
        <button
          onClick={() => setIsAddingFavorite(false)}
          style={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  formContainer: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    margin: '0 auto',
    textAlign: 'center',
  },
  header: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    border: 'none',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    border: 'none',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default AddFavoritesForm;
