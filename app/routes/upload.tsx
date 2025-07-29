import { prepareInstructions } from '../../constants/index';
import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUPloader';
import Navbar from '~/components/Navbar'
import { convertPdfToImage } from '~/lib/pdfToImage';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/utils/utils';

const Upload = () => {
    const {auth, isLoading, fs, kv, ai} = usePuterStore();
    const navigate = useNavigate()
    const [isProccessing, setIsproccessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    
    const handleFileSelect = (file: File | null) =>{
        setFile(file)
    }

    const handleAnalyze = async({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle:string, jobDescription:string, file:File})=>{

        setIsproccessing(true);
        setStatusText("Uploading...");
        const uploadedFile = await fs.upload([file]);

        if(!uploadedFile) return setStatusText("Err faild to upload file");

        setStatusText("Converting to image")

        const imageFile = await convertPdfToImage(file);

        if(!imageFile.file) return setStatusText("Err faild to convert the pdf to image");
        
        setStatusText("Uploading the image...");

        const uploadedImage = await fs.upload([imageFile.file]);

        if(!uploadedImage) return setStatusText("Err faild to upload image");

        setStatusText("Preparing data...");

        const uuid = generateUUID();

        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedBack: '',
        }

        await kv.set(`resume${uuid}`, JSON.stringify(data));

        setStatusText("Analyzing...");

        const feedBack = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )

        if(!feedBack) return setStatusText("Err faild to analyze resume");
        
        const feedBackText = typeof feedBack.message.content === 'string' ? 
        feedBack.message.content : 
        feedBack.message.content[0].text;

        data.feedBack = JSON.parse(feedBackText);
        await kv.set(`resume${uuid}`, JSON.stringify(data));
        
        setStatusText("Analyze Complete");

        console.log("Analyzed Data: ", data);
        
    }
    const handleSubmit = (e:FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form)

        const companyName = formData.get('company-name')?.toString() ;
        const jobTitle = formData.get('job-title')?.toString();
        const jobDescription = formData.get('job-description')?.toString();

        if(!file) return;
        if(!companyName || !jobTitle || !jobDescription) return;
    
        handleAnalyze({companyName, jobTitle, jobDescription, file})
        
    }
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar/>
      <section className="main-section"> 
        <div className="page-heading py-16">
            <h1>Smart feedback for your dream</h1>
            {isProccessing ? (
                <>
                    <h2>{statusText}</h2>
                    <img src="/images/resume-scan-2.gif" alt="Scan Resumes" className='w-full'/>
                </>
            ): (
                <h2>Drop your resume for ATS score and imporvemnt tips</h2>
            )}
            {!isProccessing && (
                <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                    <div className="form-div">
                        <label htmlFor="company-name">Company Name</label>
                        <input type="text" name='company-name' placeholder='Company Name' id='company-name' />
                    </div>
                    <div className="form-div">
                        <label htmlFor="job-title">Job Title</label>
                        <input type="text" name='job-title' placeholder='Job Title' id='job-title' />
                    </div>
                    <div className="form-div">
                        <label htmlFor="job-description">Job Description</label>
                        <textarea rows={5} name='job-description' placeholder='Job Description' id='job-description' />
                    </div>
                    <div className="form-div">
                        <label htmlFor="job-description">Upload Resume</label>
                        <FileUploader onFileSelecet={handleFileSelect}/>
                    </div>

                    <button className='primary-button' type='submit'>
                        Analyze Resume
                    </button>
                </form>
            )}
        </div>
      </section>
    </main>
  )
}

export default Upload