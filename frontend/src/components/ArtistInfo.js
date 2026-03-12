import React, { useEffect, useState } from 'react';
import './ArtistInfo.css'; 
import axios from 'axios';

const ArtistInfo = () => {

  const [artists, setArtists] = useState([]);


  const [formData, setFormData] = useState({
    fullName: '',
    desc: '',
    isValidation: true, 
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [validationFilter, setValidationFilter] = useState('All'); 


  const handleFetchAllArtists = async () => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken);

    try {
      const response = await axios.get("http://localhost:5000/api/artists", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setArtists(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  useEffect(() => {
    handleFetchAllArtists();
  }, []);



  const addArtist = () => {
    if (formData.fullName && formData.desc) {
      setArtists([...artists, formData]);
      setFormData({ fullName: '', desc: '', isValidation: true }); 
      setIsModalOpen(false); 
    }
  };

  const updateArtist = () => {
    if (formData.fullName && formData.desc) {
      const updatedArtists = [...artists];
      updatedArtists[editIndex] = formData;
      setArtists(updatedArtists);
      setFormData({ fullName: '', desc: '', isValidation: true }); 
      setIsModalOpen(false); 
      setEditIndex(null); 
    }
  };

  const deleteArtist = (index) => {
    const updatedArtists = artists.filter((_, i) => i !== index);
    setArtists(updatedArtists);
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };


  const openEditForm = (index) => {
    setFormData(artists[index]); 
    setEditIndex(index); 
    setIsModalOpen(true); 
  };


  const filteredArtists = artists.filter((artist) => {
    const matchesSearchTerm =
      artist.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.desc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesValidation =
      validationFilter === 'All' || (validationFilter === 'Yes' && artist.isValidation) || (validationFilter === 'No' && !artist.isValidation);

    return matchesSearchTerm && matchesValidation;
  });

  return (
    <div className="artist-info">
      <h3>Artist Information</h3>

  
      <button className="add-artist-btn" onClick={() => setIsModalOpen(true)}>
        Add Artist
      </button>

  
      <input
        type="text"
        placeholder="Search by name or description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />


      <select value={validationFilter} onChange={(e) => setValidationFilter(e.target.value)} className="filter-validation">
        <option value="All">All Statuses</option>
        <option value="Yes">Validated</option>
        <option value="No">Not Validated</option>
      </select>

 
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => {
              setIsModalOpen(false);
              setEditIndex(null); 
            }}>&times;</span>
            <h3>{editIndex === null ? 'Add New Artist' : 'Edit Artist'}</h3>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              placeholder="Artist Full Name"
              onChange={handleInputChange}
            />
            <textarea
              name="desc"
              value={formData.desc}
              placeholder="Artist Description"
              onChange={handleInputChange}
            />
            <div className="validation-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isValidation"
                  checked={formData.isValidation}
                  onChange={handleInputChange} 
                />
                Validation
              </label>
            </div>

            <button className="submit-btn" onClick={editIndex === null ? addArtist : updateArtist}>
              {editIndex === null ? 'Add Artist' : 'Update Artist'}
            </button>
          </div>
        </div>
      )}

      {/* Artist List */}
      <div className="artist-list scrollable-table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Validation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArtists.map((artist, index) => (
              <tr key={index}>
                <td>{artist.fullName}</td>
                <td>{artist.desc}</td>
                <td>{artist.isValidation ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => openEditForm(index)}>
                    Edit
                  </button>
                  <button className="-bdeletetn" onClick={() => deleteArtist(index)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArtistInfo;
