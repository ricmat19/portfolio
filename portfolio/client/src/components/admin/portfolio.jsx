import React, { useEffect, useRef, useState } from 'react';
import {useHistory} from "react-router-dom";
import IndexAPI from '../../apis/indexAPI';
import HeaderC from '../header';
import FooterC from '../footer';
import CreateC from './addProject';
import UpdateC from './updateProject';
import DeleteC from './deleteProject';

function importAll(projects) {
    let images = {};
    projects.keys().forEach((index) => { 
        images[index.replace('./', '')] = projects(index); 
    });
    return images
}
const projectThumbnails = importAll(require.context('../../images/projects'));

const PortfolioC = () => {

    let history = useHistory();

    const [createModal, setCreateModal] = useState("modal");
    const [updateModal, setUpdateModal] = useState("modal");
    const [deleteModal, setDeleteModal] = useState("modal");
    const [createdProject, setCreatedProject] = useState("");
    const [updatedProject, setUpdatedProject] = useState("");
    const [deletedProject, setDeletedProject] = useState("");

    const [titles, setTitles] = useState([])
    const [projects, setProjectTech] = useState([]);
    const [thumbnails, setThumbnails] = useState([]);
    const [technology, setTechnology] = useState([]);

    const [currentTitle, setCurrentTitle] = useState("");
    const [currentThumbnails, setCurrentThumbnails] = useState([]);
    const [currentTech, setCurrentTech] = useState([]);

    const createRef = useRef();
    const updateRef = useRef();
    const deleteRef = useRef();

    const displayCreateModal = () => {
        setCreateModal("modal modal-active");
    }

    const displayUpdateModal = (currentTitle) => {
        try{

            console.log(currentTitle)

            for(let i=0; i < thumbnails.length; i++){
                if(thumbnails[i][currentTitle] !== undefined){
                    setCurrentThumbnails(thumbnails[i][currentTitle])
                    break;
                }else{
                    setCurrentThumbnails([]);
                }
            }

            for(let i=0; i < technology.length; i++){
                if(technology[i][currentTitle] !== undefined){
                    setCurrentTech(technology[i][currentTitle])
                    break;
                }else{
                    setCurrentTech([]);
                }
            }

            setCurrentTitle(currentTitle);

            setUpdateModal("modal modal-active");
        }catch(err){
            console.log(err);
        }
    }

    const displayDeleteModal = async (project) => {
        try{
            setDeletedProject(project);
            setDeleteModal("modal modal-active");

        }catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        const fetchData = async (req, res) => {
            try{

                document.addEventListener("mousedown", (event) => {
                    if(createRef.current !== null && updateRef.current !== null && deleteRef !== null){
                        if(!createRef.current.contains(event.target)){
                            setCreateModal("modal");
                        }
                        if(!updateRef.current.contains(event.target)){
                            setUpdateModal("modal");
                        }
                        if(!deleteRef.current.contains(event.target)){
                            setDeleteModal("modal");
                        }
                    }
                })

                //Get all project thumbnails and images from DB
                const projects = await IndexAPI.get(`/projects`);

                //Adds all the projects in project_images to the projectThumbnailArray
                const projectThumbnailArray = [];
                for(let i = 0; i < projects.data.results[0].length; i++){
                    if(projectThumbnailArray.indexOf(projects.data.results[0][i].thumbnail) === -1){
                        projects.data.results[0][i].thumbnail = projectThumbnails[projects.data.results[0][i].thumbnail]
                        projectThumbnailArray.push(projects.data.results[0][i]);
                    }
                }

                //Loops through the projectThumbnailArray
                const projectTitles = [];
                const currentProjectThumbnailArray = [];
                for(let i = 0; i < projectThumbnailArray.length; i++){
                    const tempArray = [];
                    //Loops through all data provided from project_tech
                    for(let j = 0; j < projects.data.results[0].length; j++){
                        //Checks if the current item in project_tech pertains to the current project
                        if(projects.data.results[0][j].thumbnail === projectThumbnailArray[i].thumbnail){
                            tempArray.push(projects.data.results[0][j].thumbnail)
                        }
                    }
                    const key = projectThumbnailArray[i].project;
                    const tempObject = {};
                    tempObject[key] = [tempArray];
                    projectTitles.push(projectThumbnailArray[i].project);
                    currentProjectThumbnailArray.push(tempObject)
                }
                setTitles(projectTitles)
                setThumbnails(currentProjectThumbnailArray);

                //Adds all the projects in project_tech to the projectTechArray
                const projectTechArray = [];
                for(let i = 0; i < projects.data.results[1].length; i++){
                    if(projectTechArray.indexOf(projects.data.results[1][i].project) === -1){
                        projectTechArray.push(projects.data.results[1][i].project);
                    }
                }

                //Loops through the projectArray
                const currentProjectTechArray = [];
                for(let i = 0; i < projectTechArray.length; i++){
                    const tempArray = [];
                    //Loops through all data provided from project_tech
                    for(let j = 0; j < projects.data.results[1].length; j++){
                        //Checks if the current item in project_tech pertains to the current project
                        if(projects.data.results[1][j].project === projectTechArray[i]){
                            tempArray.push(projects.data.results[1][j].technology)
                        }
                    }
                    const key = projectTechArray[i];
                    const tempObject = {};
                    tempObject[key] = [tempArray];
                    currentProjectTechArray.push(tempObject)
                }

                setTechnology(currentProjectTechArray);

            }catch(err){
                console.log(err);
            }
        }
        fetchData();
    }, []);

    const filterProjects = async (tech) => {
        try{
                //Get all project_tech and project_images from the DB
                const projects = await IndexAPI.get(`/projects`);

                //Get projects that have the specified project_tech
                const projectTech = []
                for(let i = 0; i < projects.data.results[1].length; i++){
                    if(projects.data.results[1][i].technology === tech){
                        projectTech.push(projects.data.results[1][i].project)
                    }
                }

                setProjectTech(projectTech);

        }catch(err){
            console.log(err);
        }
    }

    return(
        <div className="main">
            <HeaderC/>
            <div className={createModal}>
                <div ref={createRef} className="modal-content">
                    <CreateC createModal={createModal} createdProject={createdProject => setCreatedProject(createdProject)}/>
                </div>
            </div>

            <div className={updateModal}>
                <div ref={updateRef} className="modal-content">
                    <UpdateC updateModal={updateModal} setUpdatedProject={updateProject => setUpdatedProject(updateProject)} title={currentTitle} thumbnails={thumbnails} tech={technology}/>
                </div>
            </div>

            <div className={deleteModal}>
                <div ref={deleteRef} className="modal-content">
                    <DeleteC deleteModal={deleteModal} setDeletedProject={deletedProject => setDeletedProject(deletedProject)} title={deletedProject}/>
                </div>
            </div>


            <div className="container">
                <div className="title-div">
                    <p className="title">portfolio</p>
                </div>
                <div className="create-project-div">
                    <button onClick={() => displayCreateModal()}>CREATE</button>
                </div>
                    <div className="portfolio-thumbnail-div" >
                        {thumbnails.map((thumbnail, index) => {
                            return(
                                <div className="portfolio-item-div" key={index}>
                                    {/* onClick={() => history.push(`/admin/portfolio/${project.project}`, { title: project.project })} */}
                                    <div className="portfolio-project">
                                        <img className="project-thumbnail" src={thumbnail[titles[index]][0][0].default}/>
                                        <div className="thumbnail-overlay thumbnail-overlay--blur">
                                            <div className="grid buttons-div">
                                                <div className="tech-used">
                                                    {technology.map((tech, index) => {
                                                            return(
                                                                <div className="grid project-tech" key={index}>
                                                                    {tech[titles[index]][0].map((t, index) => {
                                                                        return(
                                                                            <button key={index} onClick={() => filterProjects(t)}>
                                                                                {t}
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )
                                                    })}
                                                </div>
                                                <div className="project-buttons">
                                                    <button onClick={() => displayUpdateModal(titles[index])}>UPDATE</button>
                                                    <button onClick={() => displayDeleteModal(titles[index])}>DELETE</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
            </div>
            <FooterC/>
        </div>
    )
}

export default PortfolioC;