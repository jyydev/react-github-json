import { useState, useEffect, useRef } from 'react';
import {
  GITHUB_GET_DATA,
  GITHUB_PUT_DATA,
  GITHUB_GET_DATA_CACHE,
} from '../../global/constants';
import { Octokit } from '@octokit/core';
import { encode, decode } from 'js-base64';
import Edit from './components/Edit';
import List from './components/List';
import './index.css';

const octokit = new Octokit({
  auth: process.env.REACT_APP_GITHUB_KEY,
});

async function fetchData(setData) {
  // api version (maybe 50 limit per minute)
  const res = await fetch(GITHUB_GET_DATA, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const sc = await res.json();
  const data = JSON.parse(decode(sc.content));
  setData(data);
 
  // // NOT WORKING
  // const response = await octokit.request(`GET ${GITHUB_GET_DATA_CACHE}`);
  // const data = response.data;
  // console.log(data);
  // setData(data);

  // // cache version (alternative, not working for localhost:3000)
  // const res = await fetch(GITHUB_GET_DATA_CACHE, {
  //   method: 'GET',
  //   headers: {
  //     'Content-type': 'application/json',
  //   },
  // });
  // const data = await res.json();
  // console.log(data);
  // setData(data);
}

async function fetchSetData(data) {
  const response = await octokit.request(`GET ${GITHUB_PUT_DATA}`);
  const sha = response.data.sha;

  const rs = await octokit.request(`PUT ${GITHUB_PUT_DATA}`, {
    // headers: {
    //   Authorization: `token ${process.env.REACT_APP_GITHUB_KEY}`,
    // },
    content: encode(JSON.stringify(data, null, 2)),
    sha: sha,
    message: 'PUT update data',
  });
  console.log(rs);
}

const Home = () => {
  const [data, setData] = useState([]);
  const submittingStatus = useRef(false);

  useEffect(() => {
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(data).then((data) => (submittingStatus.current = false));
  }, [data]);

  useEffect(() => {
    fetchData(setData);
  }, []);

  return (
    <div className='app'>
      <Edit add={setData} submittingStatus={submittingStatus} />
      <List
        listData={data}
        deleteData={setData}
        submittingStatus={submittingStatus}
      />
    </div>
  );
};

export default Home;
