
import type { Route } from "./+types/home";
import { resumes } from "../../constants/index";
import ResumeCard from "~/components/ResumeCard";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume" },
    { name: "description", content: "Resume Your Journy Towards Real Enginering" },
  ];
}

export default function Home() {
    const {auth} = usePuterStore();
    const location = useLocation()
    const navigate = useNavigate();
    useEffect(()=>{
        if(!auth.isAuthenticated) navigate('/auth?next=/')
    }, [auth.isAuthenticated, ]);
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar/>
      <section className="main-section"> 
        <div className="page-heading">
          <h1>Get Real Anlytics Of Your Carrier & Plan for Next Steps</h1>
          <h2>Review Your Resume And Plan Your Journy To Become An Real Enginner</h2>
        </div>
        {resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume}/>
            ))}
          </div>
        )}
      </section>
    </main>
  )


}
