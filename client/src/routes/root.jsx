import React, { Suspense } from "react";
import { useLoaderData, Outlet, Await, defer } from "react-router-dom";
import { getSessionsCount } from "../sessions";
import { getUserInfo } from "../user";
import ls from 'localstorage-slim';

export async function loader() {
  const sessionsCount = getSessionsCount();
  const userInfo = await getUserInfo();
  return defer({ userInfo, sessionsCount });
}

function showSessionCount(sessionsCount) {  
  var sc = sessionsCount;
  if (sc == undefined) {
    sc = ls.get("sessionsCount");
  } else {
    ls.set("sessionsCount", sc, { ttl: 60 * 24 * 7 });
  }
  if (sc == undefined) {
    return (<p className="font-subtitle-2">Loading session count...</p>);
  }  
  return (
    <p className="font-subtitle-2">There are {sc} sessions indexed so far.</p>
  );
}


export default function Root() {
  const { userInfo, sessionsCount } = useLoaderData();

  return (
    <>
      <div id="header">
        <h1 className="font-title-2">OpenAI Powered PASS Summit Session Recommender</h1>
        <p className="font-subtitle-2">
        We have used integration of Azure SQL Database with OpenAI to build a session recommender for PASS Summit sessions. We have loaded all the sessions into a SQL database, and have used OpenAI to create <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#embeddings-models"> embeddings</a>, and then using <a href="https://en.wikipedia.org/wiki/Cosine_similarity" target="_blank">cosine similarity</a> to find the most similar sessions.
        </p>
        <p className="font-subtitle-2">
          Source code and and related articles is <a href="https://github.com/Azure-Samples/azure-sql-db-session-recommender">available on GitHub.</a>
        </p>
        <React.Suspense fallback={showSessionCount()}>
          <Await resolve={sessionsCount} errorElement={(<p className="font-subtitle-2">Unable to load session count 😥...</p>)}>
          {(sessionsCount) => showSessionCount(sessionsCount)}
          </Await>        
        </React.Suspense>
      </div>
      <div>      
        <Outlet /> 
      </div>
    </>
  );
}