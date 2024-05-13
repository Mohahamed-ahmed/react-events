import { Link, useNavigate,useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useQuery, useMutation} from '@tanstack/react-query';
import {fetchEvent,updateEvent,queryClient} from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx'
import ErrorBlock from '../UI/ErrorBlock.jsx';



export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams()


  const {data,isPending,isError,error}= useQuery({
    queryKey:['events', { id: params.id}],
    queryFn:({signal})=>fetchEvent({id:params.id , signal})
  })

  const {mutate} = useMutation({
    mutationFn:updateEvent,
    onMutate: async(data)=>{
      // we going to manipulate and save data behind the scenes before waiting response so the data will be edited before response
      
      await queryClient.cancelQueries({queryKey:['events',params.id]});
      const previousEvent = queryClient.getQueriesData(['events',params.id]);

      const newEvent = data.event;
      queryClient.setQueryData(['events',params.id],newEvent);

      return{previousEvent}
    },
    onError:(error,data,context)=>{
      queryClient.setQueryData(['events',params.id],context.previousEvent) //so if we not enterd a field in form when we edit, the previous context would be remains as it is 
    },
    onSettled:()=>{
      queryClient.invalidateQueries(['events',params.id])
    }
  });

  function handleSubmit(formData) {
    mutate({id:params.id, event:formData});
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if(isPending){
    content=
    <div className='center'>
      <LoadingIndicator></LoadingIndicator>
    </div>
  }

  if(isError){
    content = 
    <div>
      <ErrorBlock title='an error has occuered' message={error.info?.message||'an error has occuered'}></ErrorBlock>
    </div>
  }

  if(data){
    content = <EventForm inputData={data} onSubmit={handleSubmit}>
    <Link to="../" className="button-text">
      Cancel
    </Link>
    <button type="submit" className="button">
      Update
    </button>
  </EventForm>
  }

  return (
    <Modal onClose={handleClose}>{content}</Modal>
  );
}
