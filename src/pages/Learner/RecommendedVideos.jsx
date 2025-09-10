import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/common/Card'; // Make sure this path is correct
import { Link } from 'react-router-dom';
import './LearningPath.css';
const RecommendedVideos = ({ additionalCourses = [] }) => {
  const outletContext = useOutletContext() || {};
const learnerData = outletContext.learnerData || null;

  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const fetchRecommendations = async (retryCount = 0) => {
    if (retryCount === 0) {
      setLoading(true);
    } else {
      setRetrying(true);
    }
    setError(null);

    try {
      console.log("Calling AI API with learnerId:", learnerData?.uid);

      if (!learnerData?.uid) {
        setRecommendedVideos([]);
        setLoading(false);
        setRetrying(false);
        return;
      }

      const response = await api.post('/api/ai/match-videos', {
        learnerId: learnerData.uid,
      });

      setRecommendedVideos(response.data.recommendedVideos || []);
    } catch (error) {
      console.error('Error fetching recommended videos:', error);
      
      // Handle timeout errors with retry logic
      if (error.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Request timed out, retrying... (${retryCount + 1}/2)`);
        setTimeout(() => fetchRecommendations(retryCount + 1), 2000);
        return;
      }
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(`Failed to fetch recommendations: ${error.response.data.message}`);
      } else if (error.code === 'ECONNABORTED') {
        setError("Request timed out. The server might be busy. Please try refreshing the page.");
      } else {
        setError("Failed to fetch recommended videos. Please try again later.");
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (!learnerData) return;

    if (learnerData) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerData]);

  if (loading) {
    return <p>Loading recommendations...</p>;
  }

  if (retrying) {
    return <p>Retrying to load recommendations...</p>;
  }

  if (error) {
    return (
      <div className="error-box">
        <p>{error}</p>
        <button 
          onClick={() => fetchRecommendations()} 
          disabled={retrying}
          className="retry-button"
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: retrying ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: retrying ? 'not-allowed' : 'pointer'
          }}
        >
          {retrying ? 'Retrying...' : 'Try Again'}
        </button>
      </div>
    );
  }

  if (recommendedVideos.length === 0 && additionalCourses.length === 0) {
    return <p>No recommendations found. Try updating your interests or check back later.</p>;
  }

  return (
    <div className="video-grid">
      {recommendedVideos.map((video) => (
        <Card key={video.id} className="video-card">
          <Link to={`/videos/${video.id}`} className="video-card-link">
            <img
              src={video.thumbnailUrl || video.cloudinaryUrl || 'https://via.placeholder.com/400x200'}
              alt={video.title || 'Video thumbnail'}
              className="video-thumbnail"
            />
            <div className="video-card-content">
              {(video.providerLogoUrl || video.providerName) && (
                <div className="video-provider">
                  {video.providerLogoUrl && <img src={video.providerLogoUrl} alt={video.providerName || 'Provider logo'} className="provider-logo" />}
                  {video.providerName && <span className="provider-name">{video.providerName}</span>}
                </div>
              )}
              <h4>{video.title}</h4>
              {(video.notes || video.topics?.length > 0) && (
                <p className="skills-gained">
                  <span className="skills-label">Skills you'll gain:</span>{' '}
                  {video.topics?.length > 0 ?
                    video.topics.join(', ').length > 100 ? video.topics.join(', ').substring(0, 100) + '...' : video.topics.join(', ')
                    : video.notes?.length > 100 ? video.notes.substring(0, 100) + '...' : video.notes}
                </p>
              )}
              {(video.level || video.duration) && (
                <p className="video-meta">
                  {video.level && <span className="video-level">{video.level}</span>}
                  {video.level && video.duration && ' · '}
                  {video.duration && <span className="video-duration">{video.duration}</span>}
                </p>
              )}
            </div>
          </Link>
        </Card>
      ))}

      {additionalCourses.map((course) => (
        <Card key={course.id} className="video-card">
          <Link to={`/courses/${course.id}`} className="video-card-link">
            <img
              src={course.thumbnailUrl || 'https://via.placeholder.com/400x200'}
              alt={course.title}
              className="video-thumbnail"
            />
            <div className="video-card-content">
              <h4>{course.title}</h4>
              <p>{course.description?.length > 100 ? course.description.slice(0, 100) + '...' : course.description || 'No description available.'}</p>
              <p><strong>Modules:</strong> {course.modules?.length || 0}</p>
              <p><strong>Grade:</strong> {course.gradeLevel?.join(', ')}</p>
              <p><strong>Category:</strong> {course.category}</p>
              <Link to={`/courses/${course.id}`} className="btn">View Course</Link>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default RecommendedVideos;
