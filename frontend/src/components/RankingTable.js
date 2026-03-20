import React from 'react';
import { FaCrown } from 'react-icons/fa'; // Import icon vương miện từ react-icons
import { useNavigate } from 'react-router-dom';
import './RankingTable.css'; 

const RankingTable = ({ topTotalPlays }) => {
  const navigate = useNavigate();
  const sortedRanking = Array.isArray(topTotalPlays)
  ? [...topTotalPlays]
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 10)
  : [];
  const handleClick = (song) => {
    navigate(`/song/${song._id}`, { state: { song } });
  };

  return (
    <div className="ranking-chart" style={{ height: '400px' }}>
      <h3>Bảng xếp hạng hệ thống</h3>
      <table className="ranking-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Bài hát</th>
            <th>Ca sĩ</th>
            <th>Người đăng</th>
            <th>Số lượt phát</th>
          </tr>
        </thead>
        <tbody>
          {sortedRanking.map((song, index) => (
            <tr
              key={song._id}
              onClick={() => handleClick(song)} // Sửa lại đây để gọi hàm khi click
              className={index < 3 ? 'highlight' : ''} // Highlight top 3 bài hát
            >
              <td>
                {index + 1}
                {index === 0 && (
                  <FaCrown className="crown-scale" style={{ color: 'gold', marginLeft: '10px' }} />
                )}
                {index === 1 && (
                  <FaCrown className="crown-scale" style={{ color: 'silver', marginLeft: '10px' }} />
                )}
                {index === 2 && (
                  <FaCrown className="crown-scale" style={{ color: '#cd7f32', marginLeft: '10px' }} />
                )}
              </td>
              <td>{song.title}</td>
              <td>{song.artist?.fullName || 'Unknown Artist'}</td>
              <td>{song.creator?.fullname || 'Unknown Creator'}</td>
              <td>{song.totalPlays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
