import { Box, Container, CssBaseline } from "@mui/material";
import NavBar from "./NavBar";
import { Outlet } from "react-router";


function App() {
  // const [activities, setActivities] = useState<Activity[]>([]); --Local State

  // const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  // const [editMode, setEditMode] = useState(false);
  // const {activities, isPending} =useActivities();

  // useEffect(() => {            ----->Local State
  //   axios.get('https://localhost:5002/api/activities')
  //   .then(response => setActivities(response.data))
 
  // return () => {}  
  // }, [])
  


  // const handleSelectActivitiy = (id: string) => {
  //   setSelectedActivity(activities!.find(x => x.id === id));
  // }

  // const handleCancelSelecteActivity = () => {
  //   setSelectedActivity(undefined);
  // }

  // const handleOpenForm = (id?: string) => {
  //   if (id) handleSelectActivitiy(id);
  //   else handleCancelSelecteActivity();
  //   setEditMode(true);
  // }
  // const handleFormClose = () => {
  //   setEditMode(false);
  // }


  // const handleDelete = (id: string) => {
  //   // setActivities(activities.filter(x => x.id !== id));
  //   console.log(id);
  // }


  return (
    <Box sx={{bgcolor: '#eeeeee', minHeight: '100vh'}}>
       <CssBaseline />
       <NavBar />
       <Container maxWidth='xl' sx={{mt: 3}}>
       <Outlet />
        
       </Container>
      
    </Box>
    
 
  )
}

export default App
