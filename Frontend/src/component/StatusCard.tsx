//import { useState, useEffect } from 'react';
import './statusCard.css';

interface StatusCard {
    //time:Date;\
    private stationName:string|any;
    private sensorId:string|any;
    
    private location:string;

    private waterLavel:number;
    private rainfall:number;
}
constructor(stationName:string|any,sensorId:string|any,location:string){
    this.stationName = stationNAme;
    this.sensorId=sensorId;
    this.waterLavel=waterLavel;
    this.rainfall=rainfall;
    this.location=location;
  }

    
function ProductCart({stationName,sensorId,waterLavel,rainfall,location}:StatusCard){
  return(
    <div className="card">
      <p>{stationName}</p>
      <p>{sensorId}</p>
      <p>ระดับน้ำ:<div className='water-lavel'></div></p>
      <p>ปริมาณน้ำฝน:<div className='rainfaall'></div></p>
    </div>
  );
}

export default statusCard;