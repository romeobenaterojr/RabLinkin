import { Grid} from '@mui/material'
import ActivityList from './ActivityList';
import ActivityFilter from './ActivityFilter';





export default function ActivitiesDashboard() {
   

  return (
    <Grid container spacing={3}>
        <Grid size={8} >
             <ActivityList
          
             />
        </Grid>
        <Grid size={4}>
          <ActivityFilter />
        </Grid>
    </Grid>
  )
}
