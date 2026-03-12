import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { format, parse, isSameMonth } from "date-fns";
import "./SystemStats.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SystemStats = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleFetchAllSongs = async () => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken);

    try {
      const response = await axios.get("http://localhost:5000/api/songs", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setSongs(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  useEffect(() => {
    handleFetchAllSongs();
    setLoading(false);
  }, []);

  const chartData = {
    labels: songs.map((song) => format(new Date(song.createdAt), "yyyy-MM-dd")),
    datasets: [
      {
        label: "Total Plays",
        data: songs.map((song) => song.totalPlays),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="system-stats">
      <h2>System Statistics</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Line data={chartData} />

          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Total Plays</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, index) => (
                  <tr key={index}>
                    <td>{song.title}</td>
                    <td>{song.artist?.name || "Unknown"}</td>
                    <td>{song.totalPlays}</td>
                    <td>{format(new Date(song.createdAt), "yyyy-MM-dd")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStats;
