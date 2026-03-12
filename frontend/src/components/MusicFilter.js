// import React from 'react';
// import './MusicFilter.css';

// const MusicFilter = ({ onFilter }) => {
//   const genres = [
//     'POP', 'ROCK', 'RAP', 'R&B', 'INDIE', 'COUNTRY', 'DANCE', 'JAZZ', 'CLASSICAL', 'DIFF'
//   ];

//   const handleFilterChange = async (genre) => {
//     //
//   };

//   return (
//     <div className="filter-container">
//       <h2>Lọc theo thể loại:</h2>
//       <div className="button-container">
//         {genres.map((genre) => (
//           <button
//             key={genre}
//             className="button"
//             onClick={() => handleFilterChange(genre)}
//           >
//             {genre}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MusicFilter;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MusicFilter.css';

const MusicFilter = () => {
  const navigate = useNavigate();
  const genres = [
    'POP', 'ROCK', 'RAP', 'R&B', 'INDIE', 'COUNTRY', 'DANCE', 'JAZZ', 'CLASSICAL', 'DIFF'
  ];

  const handleFilterChange = (genre) => {
    navigate(`/songs/${genre}`); // Chuyển hướng đến SongListByGenre với thể loại tương ứng
  };

  return (
    <div className="filter-container">
      <h2>Lọc theo thể loại:</h2>
      <div className="button-container">
        {genres.map((genre) => (
          <button
            key={genre}
            className="button"
            onClick={() => handleFilterChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MusicFilter;
