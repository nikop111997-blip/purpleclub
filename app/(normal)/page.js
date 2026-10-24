import AboutRunClub from "@/component/AboutRunClub";
import FaqSection from "@/component/FAQ";
import Home from "@/component/Gallery";
import HomePage from "@/component/Homepage";
import OneSundaySection from "@/component/Onesundaysection";
import ScrollBoxes from "@/component/ScrollBoxes";
import WheelCarousel from "@/component/WheelCrousel";
import { auth } from "@/lib/auth";

export default async function Page(){
  const session =  await auth()
  return(
    <>
    <HomePage session={session}/>
    
    <AboutRunClub />
    <ScrollBoxes session={session}/>
    <OneSundaySection/>
    <Home/>
    
    <FaqSection session={session}/>
<WheelCarousel photoWidth={38} compactPhotoSize={300} contentWidth={1000}  loop={true} loopOnMobile={false} />    </>
  )
}