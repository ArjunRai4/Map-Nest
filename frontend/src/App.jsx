import { useEffect } from 'react';
import './App.css'
import SafeRouteMap from './components/SafeRouteMap';
import axios from 'axios';

function App() {

  const [userLocation, setUserLocation] = useState(null); 
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  //get user location and fetch map data
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async(position)=>{
        const lat=position.coords.latitude;
        const lng=position.coords.longitude;
        setUserLocation([lat,lng]);

        try {
          //step 1:trigger backend to fetch roads around user
          await axios.post('/api/map/init',{lat,lng});

          //step 2:fetch roads from session
          const res=await axios.get('/api/map/roads');
          setRoads(res.data.roads || []);
        } catch (error) {
          console.error('Map fetch error:',error.message);
          alert('Could not load map data');
        }
        finally{
          setLoading(false);
        }
      },
      (err)=>{
        console.error('GPS error:',err.message);
        alert('Please allow location access');
        setLoading(false);
      }
    )
  },[]);

  if (loading) return <div style={{ padding: 20 }}>Loading map...</div>;
  if (!userLocation) return <div>Unable to get your location</div>;

  return (
    <div>
      <SafetyMap userLocation={userLocation} roads={roads} />
    </div>
  );
}

export default App;
