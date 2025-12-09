import React from 'react'
import Navbar from '../components/Navbar';
import Herosection from '../components/Herosection';
import Aboutsection from '../components/Aboutsection';

const Home = () => {
    return (
        <div>
            <Navbar />
            <Herosection/>
            <Aboutsection/>
            
        </div>
    )
}

export default Home