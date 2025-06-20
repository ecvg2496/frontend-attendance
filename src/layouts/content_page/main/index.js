// Material UI
import { 
	Container,
	Card,
	CardMedia,
	CardContent,
	CardHeader,
	Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import PageLayout from "examples/LayoutContainers/PageLayout";

import NavBar from "../nav_bar";

// assets
import containerBg1 from "assets/images/e20/header.jpg";
import img1 from "assets/images/e20/line_2_picture.png";
import img2 from "assets/images/e20/part time icon.png";
import img3 from "assets/images/e20/full time icon.png";
import img4 from "assets/images/e20/step1_icon.png";
import img5 from "assets/images/e20/step2_icon.png";
import img6 from "assets/images/e20/step3_icon.png";
import img7 from "assets/images/e20/step4_icon.png";
import img8 from "assets/images/e20/step5_icon.png";
import img9 from "assets/images/e20/female_icon_1.png";
import img10 from "assets/images/e20/philippine_map_icon.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { dataService } from "global/function";
import ScrollAnimation from "react-animate-on-scroll";



function MainPage() {

	// navigation
	const navigate = useNavigate();
	const location = useLocation(); 
	const from = location.state?.from?.pathname || "/";
	const prevPage = () => navigate(from, { replace: true })
	const toPage = (url, params={}) => navigate(url, { state: { from: location, ...params }, replace: true })

	const [careers, setCareers] = useState()

	useEffect(() => {
		init()
	},[])

	const init = () => {
		dataService('POST', 'hr/careers/all', {
			filter: [
				{
					target: 'status',
					operator: '=',
					value: 'active',
				}
			],
			order: [{
				target: 'posted_at',
				value: 'desc'
			}],
		}).then((result) => {
			console.log('debug careers response', result);
			result = result.data['careers']
			setCareers(result)
		}).catch((err) => {
			console.log('debug careers error response', err);

		})
	}

	return (
		<PageLayout background="black">
			<NavBar color="white" />
			<MDBox positon='relative' height='100vh' width='100vw' py="10rem" px={'5rem'} sx={{
				// backgroundImage: `url(${containerBg1})`,
				// backgroundRepeat: "no-repeat",
				// backgroundSize: "cover",
				// backgroundPositionX: { xl: '-180px' },
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}>
				<MDBox
					component='img'
					src={containerBg1}
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%", // Matches the Box width
						height: "inherit",
						objectFit: "cover", // Ensures the image covers the box nicely
					}}
				/>
				<Grid container sx={{ zIndex: 0 }}>
					<Grid xs={6}>
						<MDBox >
							<ScrollAnimation animateIn="animate__fadeInTopLeft">
								<MDTypography color='info' fontWeight="bold" sx={{ fontSize: 140, lineHeight: .9 }}>Come Work With Us</MDTypography>
							</ScrollAnimation>
							<ScrollAnimation animateIn="animate__fadeInLeft">
								<MDButton sx={{ 
								color: 'dark_info.main', 
								borderRadius: '50px', 
								fontSize: 30,
								fontWeight: 'bold',
								px: 13,
								mt: '2rem',
								}}
								href="/careers"
								>Apply Now</MDButton>
							</ScrollAnimation>
						</MDBox>
					</Grid>
					<Grid xs={6}></Grid>
				</Grid>
			</MDBox>
			<MDBox height='100vh' mb="5rem">
				<Container sx={{ display: 'flex', alignItems: 'center', height: 'inherit' }}>
					<Grid container>
						<Grid xs={6}>
							<ScrollAnimation animateIn="animate__fadeInLeft">
								<MDBox component="img" src={img1} width='100%' pr="5rem" />
							</ScrollAnimation>
						</Grid>
						<Grid xs={6}>
							<ScrollAnimation animateIn="animate__fadeInTopRight">
								<MDBox my="3rem">
									<MDBox display="flex">
										<MDTypography color="info" fontWeight="bold" sx={{ fontSize: 50 }}>Part-time</MDTypography>
										<MDBox component="img" src={img2} width="10%" height="10%" ml="10px" />
									</MDBox>
									<MDTypography color='white'>If you can only work for limited hours during the day, and you are looking for an additional income stream, these positions are for you.</MDTypography>
								</MDBox>
							</ScrollAnimation>
							<MDBox mt="6rem" mb="3rem" sx={{ border: 3, borderColor: 'common.white', borderRadius: '5px' }} />
							<ScrollAnimation animateIn="animate__fadeInBottomLeft">
								<MDBox>
									<MDBox display="flex">
										<MDTypography color="info" fontWeight="bold" sx={{ fontSize: 50 }}>Full Time</MDTypography>
										<MDBox component="img" src={img3} width="10%" height="10%" ml="10px" />
									</MDBox>
									<MDTypography color='white'>If you are looking for stability and long-term positions and can work full time, these positions are for you...</MDTypography>
								</MDBox>
							</ScrollAnimation>
						</Grid>
					</Grid>
				</Container>
			</MDBox>
			<MDBox px="5rem" py="3rem" sx={{
				bgcolor: 'common.white',
			}}>
				<MDBox>
					<Grid container>
						<Grid xs={6}>
							<MDBox>
								<ScrollAnimation animateIn="animate__fadeInDownBig">
									<MDTypography color='info' fontWeight="bold" mb="10px" sx={{ fontSize: 100, lineHeight: .9 }}>Let&apos;s<br/>Grow Together!</MDTypography>
								</ScrollAnimation>
								<ScrollAnimation animateIn="animate__fadeIn">
									<MDTypography pr="5rem" pt={2} color="black">
									With more than 10 years of collective experience in the outsourcing industry, we are looking to recruit and train 
									Filipinos to become world-class support to our clients from sales, admin, tech, creative and more.
									<br /><br />
									If your are looking to join a family of go-getters, values-driven, and collaborative, click here to see different open positions and apply.
									</MDTypography>
								</ScrollAnimation>
							</MDBox>
						</Grid>
						<Grid xs={6}>
							<MDBox>
								<ScrollAnimation animateIn="animate__fadeInRight" animateOut="animate__fadeOutRight">
									<MDBox py="7px" sx={{ display: 'flex', alignItems: 'center' }}>
										<MDBox component='img' src={img4} width="20%" height="20%"  />
										<MDTypography color="black" sx={{ flexGrow: 1 }}>
											Choose your desired position and click apply.
											<br/><br/> 
											Fill in the form and follow instructions for next steps
										</MDTypography>
									</MDBox>
								</ScrollAnimation>
								<ScrollAnimation animateIn="animate__fadeInRight" animateOut="animate__fadeOutRight">
									<MDBox py="7px" sx={{ display: 'flex', alignItems: 'center' }}>
										<MDTypography color="black" sx={{ flexGrow: 1, flexDirection: 'row-reverse', textAlign: "right" }}>
											Remi at Eighyt20 Virtual will reach out and schedule for your initial interview.
										</MDTypography>
										<MDBox component='img' src={img5} width="20%" height="20%"  />
									</MDBox>
								</ScrollAnimation>
								<ScrollAnimation animateIn="animate__fadeInRight" animateOut="animate__fadeOutRight">
									<MDBox py="7px" sx={{ display: 'flex', alignItems: 'center' }}>
										<MDBox component='img' src={img6} width="20%" height="20%"  />
										<MDTypography color="black" sx={{ flexGrow: 1 }}>
											You will then be scheduled for a final interview with the client.
										</MDTypography>
									</MDBox>
								</ScrollAnimation>
								<ScrollAnimation animateIn="animate__fadeInRight" animateOut="animate__fadeOutRight">
									<MDBox py="7px" sx={{ display: 'flex', alignItems: 'center' }}>
										<MDTypography color="black" sx={{ flexGrow: 1, flexDirection: 'row-reverse', textAlign: "right" }}>
											You will then be scheduled for a final interview with the client.
										</MDTypography>
										<MDBox component='img' src={img7} width="20%" height="20%"  />
									</MDBox>
								</ScrollAnimation>
								<ScrollAnimation animateIn="animate__fadeInRight" animateOut="animate__fadeOutRight">
									<MDBox py="7px" sx={{ display: 'flex', alignItems: 'center' }}>
										<MDBox component='img' src={img8} width="20%" height="20%"  />
										<MDTypography  color="black" fontWeight="bold" sx={{ flexGrow: 1, fontSize: 50 }}>HIRED!</MDTypography>
									</MDBox>
								</ScrollAnimation>
							</MDBox>
						</Grid>
					</Grid>
				</MDBox>
				<MDBox>
					<Grid container>
						<Grid xs={3} px="2rem" sx={{ display: 'flex', alignItems: 'center' }}>
							<ScrollAnimation animateIn="animate__lightSpeedInLeft">
								<MDBox display="flex">
									<MDTypography color="info" fontWeight="bold" textAlign='right' sx={{ flexGrow: 1, fontSize: 75, lineHeight: 1.1 }} >Choose Your Path</MDTypography>
								</MDBox>
							</ScrollAnimation>
						</Grid>
						<Grid xs={9}>
							<ScrollAnimation animateIn="animate__lightSpeedInRight">
								<MDBox sx={{ display: 'flex', flexDirection: "row", overflow: 'auto' }}>
									{/* {careers && Object.keys(careers).map((item, index) => (
										<Card sx={{ minWidth: 345, height: 350, bgcolor: '#f4f4f4', mx: 2, mb: 2, cursor: 'pointer' }} onClick={() => toPage('/careers', { key: index })}>
											<CardHeader title={<MDTypography variant='h3' fontWeight="bold" sx={{ flexGrow: 1, lineHeight: 1 }} color="info">
												{careers[item].title}
												</MDTypography>} />
											<Divider />
											<CardContent sx={{ overflow: 'hidden' }}>
												<MDTypography color="black"><div dangerouslySetInnerHTML={{__html: careers[item].descriptions}} /></MDTypography>
											</CardContent>
										</Card>
									))} */}
									{careers && Object.keys(careers).map((item, index) => (
										<Card sx={{ minWidth: 345, height: 350, bgcolor: '#f4f4f4', mx: 2, mb: 2, cursor: 'pointer' }} onClick={() => toPage('/careers', { key: index })}>
											<CardMedia
												sx={{ height: 275 }}
												image={img9}
												title="green iguana"
											/>
											<CardContent>
												<MDBox component="img" />
												<MDTypography variant='h3' fontWeight="bold" sx={{ flexGrow: 1, lineHeight: 1 }} color="info">
												{careers[item].title}
												</MDTypography>
											</CardContent>
										</Card>
									))}
								</MDBox>
							</ScrollAnimation>
						</Grid>
					</Grid>
				</MDBox>
			</MDBox>
			<MDBox>
				<Grid container>
					<Grid xs={6}>
						<MDBox component="img" src={img10} width="100%" />
					</Grid>
					<Grid xs={6} py="3rem" alignContent='center' px={5}>
						<ScrollAnimation animateIn="animate__bounceInRight">
							<MDTypography color="info" fontWeight="bold" textAlign='right' sx={{ flexGrow: 1, fontSize: 75, lineHeight: 1.1 }}>
							Advocates For Improving The Overall Standard Of The Philippines Online Workforce
							</MDTypography>
							<MDTypography color='white' textAlign="right" pt="1rem">
							With more than 10 years of collective experience in the outsourcing industry, we are 
							looking to recruit and train Filipinos to become world-calss support to our clients from sales, admin, tech, creative and more.
							</MDTypography>
						</ScrollAnimation>
					</Grid>
				</Grid>
			</MDBox>
		</PageLayout>
	);
}

export default MainPage;
