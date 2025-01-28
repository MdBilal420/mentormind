import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube } from "lucide-react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const Resource = ({
	setInput,
	setResourceType,
	videos,
	setSelectedResource,
	pdfs,
}) => {
	const handleIput = (value, type) => {
		setResourceType(type);
		setInput(value);
	};

	const handleVideoClick = (video) => {
		handleIput(video.title, "video");
		setSelectedResource(video.url);
	};

	return (
		<Tabs
			defaultValue='sources'
			className='flex-grow flex flex-col w-full sm:w-[160px] h-[540px] sm:h-[540px]'
		>
			<TabsList>
				{/* <TabsTrigger value='search' disabled={true}>
					Search
				</TabsTrigger> */}
				<TabsTrigger value='sources'>Sources</TabsTrigger>
			</TabsList>
			{/* <TabsContent value='search'>
				<Card className='flex-grow flex flex-col w-full sm:w-[240px] h-[500px] sm:h-[500px] mr-2 p-4'>
					<YoutubeSearch handleVideoClick={handleVideoClick} />
				</Card>
			</TabsContent> */}
			<TabsContent value='sources'>
				<Card className='flex-grow flex flex-col w-full sm:w-[240px] h-[540px] sm:h-[540px] mr-2'>
					<CardHeader>
						<CardTitle>Sources</CardTitle>
					</CardHeader>
					<CardContent className='flex-grow flex flex-col overflow-y-auto'>
						<div className='h-[200px]'>
							<Accordion type='single' collapsible='true'>
								<AccordionItem value={videos[0].title} disabled={true}>
									<AccordionTrigger>
										Videos{" "}
										<span className='text-muted-foreground text-xs'>
											{" "}
											(Coming Soon)
										</span>
									</AccordionTrigger>
									{videos.map((video, index) => (
										<AccordionContent key={`${video.url}-${video.title}`}>
											<Button
												variant='ghost'
												onClick={() => {
													handleVideoClick(video);
												}}
											>
												<Youtube />
												{video.title}
											</Button>
										</AccordionContent>
									))}
								</AccordionItem>
								<AccordionItem value='item-1'>
									<AccordionTrigger>Documents</AccordionTrigger>
									{pdfs.map((pdf, index) => (
										<AccordionContent key={`${pdf.name}-${index}`}>
											<Button
												variant='link'
												onClick={() => handleIput(pdf.name, "pdf")}
											>
												{pdf.name}
											</Button>
										</AccordionContent>
									))}
								</AccordionItem>
							</Accordion>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
};

export default Resource;
