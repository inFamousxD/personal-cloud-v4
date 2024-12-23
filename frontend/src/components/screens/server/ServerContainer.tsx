import axios from 'axios'
import React from 'react'

const ServerContainer = () => {
  axios.get('http://localhost:5174/api/status')
    .then(data => {
      console.log(data)
    })

  return (
    <React.Fragment>
      Server Health Test
    </React.Fragment>
  )
}

export default ServerContainer