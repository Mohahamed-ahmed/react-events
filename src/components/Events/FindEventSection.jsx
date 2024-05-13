import { useRef , useState} from 'react';
import {  useQuery} from '@tanstack/react-query';
import { fetchEvents } from '../../util/http';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import EventItem from './EventItem';

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, SetsearchTerm] = useState();

  function handleSubmit(event) {
    event.preventDefault();
    SetsearchTerm(searchElement.current.value);
  }

  const {data,isLoading,isError,error} = useQuery({
    queryKey:['events' , {search:searchTerm}],
    queryFn:({signal})=>fetchEvents({signal,searchTerm}),
    enabled: searchTerm !== undefined  // undefined means initially not enterd anything in search bar so the request disabled when the search bar is undefined(during the first load ) but if there is thing in search bar or words wrote and delted it will be
    //isloading will be false if enabled is false and there is no request sent so it is better then ispending
  })

  let content = <p>Please enter a search term and to find events.</p>;

  if(isLoading){
    content = <LoadingIndicator></LoadingIndicator>
  }

  if(isError){
    content = <ErrorBlock title="an error occured" message={error.info?.message || 'couldnt fetch'}></ErrorBlock>
  }

  if(data){
    content = <ul className='events-list'>
      {data.map((event)=>(
        <li key = {event.id}><EventItem event={event}></EventItem></li>
      ))}
    </ul>
  }


  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
