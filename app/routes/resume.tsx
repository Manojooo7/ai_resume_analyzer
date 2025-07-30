export const meta = () =>([
    {title: 'ResUme | Review'},
    {name: 'description', content: 'Detaild Layout'}
])

import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { usePuterStore } from '~/lib/puter'

const Resume = () => {
  const {auth, isLoading, fs, kv} = usePuterStore()
  const {id} = useParams()

  const [imageUrl, setImageurl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [feedback, setFeedback] = useState('');

  const navigate = useNavigate()

  useEffect(()=>{
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if(!resume) return;

      const data = JSON.parse(resume);

      const resumeBlob = await fs.read(data.resumePath);

      if(!resumeBlob) return;

      const pdfbBlob = new Blob([resumeBlob], {type: 'application/pdf'})

      const resumeUrl = URL.createObjectURL(pdfbBlob);
      setResumeUrl(resumeUrl)

      const imageBlob = await fs.read(data.imagePath);

      if(!imageBlob) return;
      const imageurl = URL.createObjectURL(imageBlob);
      setImageurl(imageurl)

      setFeedback(data.feedBack)

      console.log(`Image url:  ${imageUrl}, Resume url: ${resumeUrl}, Feedback: ${feedback}`);
      
    }

    loadResume();
  }, [id])


  return (
   <main className='!pt-0'>
      <nav className='resume-nav'>
       <Link to="/" className='back-button'>
          <img src='/icons/back.svg' alt='logo' className='w-2.5 h-2.5'/>
          <span className='text-gray-800 text-sm font-semibold'>Back to home page</span>
       </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url(/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
              <a href="">
                <img src={imageUrl} alt="Resume" className='w-full h-full object-contain rounded-2xl' title='Resume'/>
              </a>

              <h1>true</h1>
            </div>
          )}
        </section>
      </div>

   </main>
  )
}

export default Resume