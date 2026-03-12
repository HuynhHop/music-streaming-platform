  // // src/pages/ArtistPage.js
  // import React, { useState, useEffect } from 'react';
  // import { useParams } from 'react-router-dom';
  // import './ArtistPage.css'; // Import file CSS cho ArtistPage

  // const ArtistPage = () => {
  //   const { id } = useParams();  // Lấy id của nghệ sĩ từ URL
  //   const [artist, setArtist] = useState(null);

  //   // Dữ liệu mẫu nghệ sĩ
  //   const allArtists = [
  //     { id: 1, fullName: 'Ca sĩ 1', desc: 'Mô tả về ca sĩ 1', isValidation: true },
  //     { id: 2, fullName: 'Ca sĩ 2', desc: 'Mô tả về ca sĩ 2', isValidation: false },
  //     { id: 3, fullName: 'Ca sĩ 3', desc: 'Mô tả về ca sĩ 3', isValidation: true },
  //     // Thêm các nghệ sĩ khác
  //   ];

  //   useEffect(() => {
  //     // Lọc thông tin nghệ sĩ theo id
  //     const artist = allArtists.find((artist) => artist.id === parseInt(id));
  //     setArtist(artist);
  //   }, [id]);

  //   const toggleValidation = () => {
  //     setArtist((prevState) => ({
  //       ...prevState,
  //       isValidation: !prevState.isValidation,
  //     }));
  //   };

  //   return (
  //     <div className="artist-page">
  //       {artist ? (
  //         <>
  //           <h2>{artist.fullName}</h2>
  //           <p>{artist.desc}</p>
  //           <p>
  //             <strong>Trạng thái xác thực: </strong>
  //             {artist.isValidation ? 'Đã xác thực' : 'Chưa xác thực'}
  //           </p>
  //           <button onClick={toggleValidation} className="validate-button">
  //             {artist.isValidation ? 'Hủy xác thực' : 'Xác thực'}
  //           </button>
  //         </>
  //       ) : (
  //         <p>Không tìm thấy nghệ sĩ.</p>
  //       )}
  //     </div>
  //   );
  // };

  // export default ArtistPage;

  // src/pages/ArtistPage.js
  import React, { useState, useEffect } from 'react';
  import { useParams } from 'react-router-dom';
  import './ArtistPage.css'; // Import file CSS cho ArtistPage

  const ArtistPage = () => {
    const { id } = useParams();  // Lấy id của nghệ sĩ từ URL
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true); // Thêm trạng thái loading

    // Fetch artist from API
    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken'); // Adjust based on your token storage
      const fetchArtist = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/artists/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`, // Add Bearer token if needed
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch artist');
          }
          const data = await response.json();
          setArtist(data); // Update state with fetched artist
        } catch (error) {
          console.error('Error fetching artist:', error);
        } finally {
          setLoading(false); // Set loading to false once the data is loaded or error occurs
        }
      };

      fetchArtist();
    }, [id]);

    const toggleValidation = () => {
      setArtist((prevState) => ({
        ...prevState,
        isValidation: !prevState.isValidation,
      }));
    };

    if (loading) {
      return <p>Loading...</p>; // Hiển thị loading khi đang fetch dữ liệu
    }

    return (
      <div className="artist-page">
        {artist ? (
          <>
            <h2>{artist.fullName}</h2>
            <p>{artist.desc}</p>
            <p>
              <strong>Trạng thái xác thực: </strong>
              {artist.isValidation ? 'Đã xác thực' : 'Chưa xác thực'}
            </p>
          </>
        ) : (
          <p>Không tìm thấy nghệ sĩ.</p>
        )}
      </div>
    );
  };

  export default ArtistPage;
