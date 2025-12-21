import axios from 'axios'
import React from 'react'

const API_URL = import.meta.env.VITE_API_URL;

const ServerContainer = () => {
    axios.get(API_URL)
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