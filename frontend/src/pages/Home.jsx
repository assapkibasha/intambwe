import React from 'react'
import Navbar from '../components/Navbar'
import HowItWorks from '../components/HowItWorks'
import BlogSection from '../components/Blog'

const Home = () => {
    return (
        <div className='min-h-screen'>
            <HowItWorks />
            <BlogSection />

        </div>
    )
}

export default Home