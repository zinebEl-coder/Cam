import React, { Component } from 'react';
import Webcam from "react-webcam";
import { createWorker, createScheduler } from 'tesseract.js';
import './App.css';
import FullScreen, { fullScreenSupported } from 'react-request-fullscreen'
import {
  Row,
  Col,
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Modal,
  Button
} from 'react-bootstrap';
import logo from './Adria-logo.png';
const scheduler = createScheduler();
const worker = createWorker();

// const worker = createWorker({
//   logger: m => console.log(m),
// });

// let timerId = null;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingMessage: "",
      ocrResult: "",
      started: false,
      terminated: false,
      isFullScreen: false,
      // progress: 0,
      x:"",
      y:"",
      deviceOrientation: window.screen.orientation.angle,
    }
    this.webcamRef = React.createRef();
    this.canvasRef = React.createRef();

    this.doOCR = this.doOCR.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.loadTesseract = this.loadTesseract.bind(this);
    this.reset = this.reset.bind(this);

    window.addEventListener('orientationchange', (event) => {
      this.setState({deviceOrientation: event.target.screen.orientation.angle});
      console.log("the orientation of the device is now " + event.target.screen.orientation.angle);

    });
  }
  componentDidMount() {
    // this.setState({loading: false, loadingMessage: ''});
      
  //     // const { data: { text } } = await worker.recognize(this.state.imageSrc);
  //     // this.setState({ocrResult: text, loading: false, loadingMessage: ""});

    this.loadTesseract();

  }
  onFullScreenChange (isFullScreen) {
    this.setState({
      isFullScreen:isFullScreen,

    });
    console.log("on full screen change",isFullScreen);

  }



  async doOCR () {
    if (typeof this.webcamRef.current !== "undefined" && this.webcamRef.current !== null && this.webcamRef.current.video.readyState === 4) {
    // if (this.state.imageSrc !== null && this.state.imageSrc !== "") {

      const video = this.webcamRef.current.video;
      const canvas = this.canvasRef.current;

       // Get Video Properties
      const videoWidth = this.webcamRef.current.video.videoWidth;
      const videoHeight = this.webcamRef.current.video.videoHeight;

      // Set video width
      // this.webcamRef.current.video.width = videoWidth;
      // this.webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      
      const { data: { text } } = await scheduler.addJob('recognize', canvas);

      // // text.split('\n').forEach((line) => {
      if(text && text !== "" && text.length > 0) {
        console.log(text);
        this.setState({ocrResult: this.state.ocrResult + text});
      }}
  };

  
  handleStart(e){
    e.preventDefault();
    this.setState({started: true, loading: true}, () => {
      this.setState({loading: false});
      let timesRun = 0;
      let interval = setInterval(async () => {
        timesRun += 1;
        if (timesRun === 400) {
          await scheduler.terminate();
          clearInterval(interval);
          this.setState({terminated: true});
        }
        this.doOCR();
      }, 100);
    }); 
  }
  
  async loadTesseract() {
    this.setState({loading: true, loadingMessage: "Loading Tesseract..."});
      for (let i = 0; i < 4; i++) {
        // const worker = createWorker({
        //   logger: m => {
        //     // console.log(m);
        //     this.setState({loadingMessage: "Loading.. " + (m.progress * 100).toFixed(1) + "%" });
        //   }
        // });
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        scheduler.addWorker(worker);
      }

      this.setState({loading: false,});
  }

  async reset(e) {
    e.preventDefault();
    await scheduler.terminate();
    this.setState({started: false, terminated: false, ocrResult: ""}, this.loadTesseract);
  }






  requestOrExitFullScreenByElement () {

    this.elFullScreenRef.fullScreen(this.elRef);


  }
  
  render() {





    return (
      <div>

        <Modal show={this.state.loading} onHide={()=>{}} className="loadingModal" keyboard={false}>
          <Modal.Body>
              <Row>
                  <Col xs={12} md={12}>
                      <div className="spinner">
                          <span style={{fontSize: '11px'}}>{this.state.loadingMessage}</span>
                      </div>
                  </Col>
              </Row>
          </Modal.Body>
        </Modal>

        {this.state.deviceOrientation === 0 &&
        <Navbar bg="light" variant="light">
          <Navbar.Brand onClick={(e) => {/*this.doOCR();*/ this.reset(e)}}>
            <img
            alt=""
            src={logo}
            width="135"
            height="43"
            className="d-inline-block align-top"
            />
          </Navbar.Brand>
        </Navbar>
        }
        <Container fluid>
        {this.state.started === true ?
        <div>
          {this.state.terminated === false ?

              <div className='app'>

                <Row>
                  <Col sm={12} xs={12} xl={12} lg={12}  >

                <FullScreen   ref={ref => { this.elFullScreenRef = ref }} >
                  <div id="fullwidth-video">
   <div  onClick={this.requestOrExitFullScreenByElement.bind(this)}  ref={ref => { this.elRef = ref }}



         className="fullwidth-video-bg"
   >


         <Webcam

             id= "myCam"

             ref={this.webcamRef}
             muted={false}
             audio={false}
             videoConstraints={{facingMode: 'environment',}}
             forceScreenshotSourceSize={true}

         />
       </div>
     </div>



                </FullScreen>

                  </Col>
                  <Col xs={12}>


                <canvas
                id="myCanvas"
                ref={this.canvasRef}
                style={{
                  // backgroundColor: "red",
                  display: "none",
                  // position: "absolute",
                  // marginLeft: "auto",
                  // marginRight: "auto",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  // textAlign: "center",
                  // zIndex: 10,
                  width: "100%",
                  height: "auto",
                }}
              />
              </Col>
              </Row>
            </div>



              :
          <Row>
            <Col>
              <div >
              <textarea 
                style={{
                  margin: "5px 0",
                  width:"100%", 
                  height: "382px",
                  fontSize: "13px"
                }}
                disabled
                onChange={(e) =>{console.log(e.target.name)} }
                value={this.state.ocrResult} />
              </div>
            </Col>
          </Row>
          }
        </div>
        : 
        <Row>
          <Col>
            <div className="startBtnWrapper" >
              <button className="startBtn" onClick={(e) => {this.handleStart(e);}} >START</button>
            </div>
          </Col>
        </Row>
        }
        {this.state.deviceOrientation === 0 &&
        <Row className="footer">
          <Col>
            <p>Adria Business & Technology</p>
            <p>2021 © All rights reserved.</p>
          </Col>
        </Row> 
        }
        </Container>
      </div>
    )
  }
}