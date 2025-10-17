import { Box, Container, CssBaseline } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react"
import NavBar from "./NavBar";
import ActivitiesDashboard from "../../features/activities/dashboard/ActivitiesDashboard";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    axios.get('https://localhost:5002/api/activities')
    .then(response => setActivities(response.data))
 
  return () => {}  
  }, [])

  const handleSelectActivitiy = (id: string) => {
    setSelectedActivity(activities.find(x => x.id === id));
  }

  const handleCancelSelecteActivity = () => {
    setSelectedActivity(undefined);
  }

  const handleOpenForm = (id?: string) => {
    if (id) handleSelectActivitiy(id);
    else handleCancelSelecteActivity();
    setEditMode(true);
  }
  const handleFormClose = () => {
    setEditMode(false);
  }
  const handleSubmitForm = (activity: Activity) => {
    if (activity.id) {
      setActivities(activities.map(x => x.id === activity.id ? activity : x));
    } else {
      const newActivity = {...activity, id: activities.length.toString()};
      setSelectedActivity(newActivity);
      setActivities([...activities, newActivity]);
    }
    setEditMode(false);
  }

  const handleDelete = (id: string) => {
    setActivities(activities.filter(x => x.id !== id));
  }


  return (
    <Box sx={{bgcolor: '#eeeeee'}}>
       <CssBaseline />
       <NavBar openForm={handleOpenForm} />
       <Container maxWidth='xl' sx={{mt: 3}}>
        <ActivitiesDashboard 
        activities={activities}
        selectActivity={handleSelectActivitiy}
        cancelSelectActivity={handleCancelSelecteActivity}
        selectedActivity={selectedActivity}
        editMode={editMode}
        openForm={handleOpenForm}
        closeForm={handleFormClose}
        submitForm={handleSubmitForm}
        deleteActivity={handleDelete}
        />
       </Container>
      
    </Box>
    
 
  )
}

export default App
