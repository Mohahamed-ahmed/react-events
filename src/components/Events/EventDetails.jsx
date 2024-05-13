import { Link, Outlet } from 'react-router-dom';
import { useParams ,useNavigate} from 'react-router-dom';
import { useState } from 'react';

import Header from '../Header.jsx';

import { useQuery , useMutation} from '@tanstack/react-query';
import {fetchEvent,deleteEvent,queryClient} from '../../util/http.js';

import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';


export default function EventDetails() {

  const params = useParams();
  const navigate = useNavigate();
  const [ isDeleting, SetIsDeleting] = useState(false);

  const {data,isPending,isError,error} = useQuery({
    queryKey:['events',params.id],
    queryFn:({signal})=>fetchEvent({ id:params.id , signal })
  })

  const {mutate, isPending:isPendingDeleting,isError:isErrorDeleting,error:errorDeleting} = useMutation({
    mutationFn:deleteEvent,
    onSuccess:()=>{
      queryClient.invalidateQueries({ // we do this because after deleting the data become outdated so we need to refetch and this happen by calling queryclient
        queryKey:['events'],
        refetchType:'none' //so in the page of eventdetails there was refetching because of the key as i want the refetch in events component not here in details so this caused a failed request and to solve this we set refetch in details page to none but any other compo has the key of events which is events will be refetched
      }),
      navigate('/events')
    }
  })

  function startDeleting(){
    SetIsDeleting(true);
  }

  function cancelDeleting(){
    SetIsDeleting(false)
  }

  const deleteEventHandler=()=>{
    mutate({id:params.id})
  }

  let content;

  if(isPending){
    content=<div id='event-details-content' className='center'>
      <p>fetching event data...</p>
    </div>
  }

  if(isError){
    content=<div id='event-details-content' className='center'>
      <ErrorBlock title={'error happend'} message={error.info?.message||'an error happend'}></ErrorBlock>
    </div>
  }

  if(data){
    content = (
      <>
        <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={startDeleting}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
              </div>
              <p id="event-details-description">{data.decription}</p>
            </div>
          </div>
      </>
    )
  }

  return (
    <>
    {isDeleting && (
       <Modal onClose={cancelDeleting}>
       <h2>Are You Sure</h2>
       <p>do you relly want to delete this event? this action cannot be undone</p>
       <div className='form-actions'>
        {isPendingDeleting && <p>Deleting, please wait...</p>}
       {!isPendingDeleting && (
        <>
        <button onClick={cancelDeleting} className='button-text'>Cancel</button>
        <button onClick={deleteEventHandler} className='button'>Delete</button>
      </>
       )}
       </div>
       {isErrorDeleting && <ErrorBlock title='error occured' message={ errorDeleting.info?.message||'an error deletion has occuered'}></ErrorBlock>}
     </Modal>
    )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
      {content}
      </article>
      </>
  );
}
