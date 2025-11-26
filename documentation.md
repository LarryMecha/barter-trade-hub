
KABARAK UNIVERSITY

DEPARTMENT OF COMPUTER SCIENCE & IT

SCHOOL OF SCIENCE ENGINEERING AND TECHNOLOGY
 A Web-Based Platform for Barter and Cash-Top-Up Item Exchange

Registration Number: INTE/MG/1730/09/22
STUDENT NAME: MOSES WAMBUA NZONZO


A Project Documentation Submitted to the School of Science in Partial Fulfilment of the Requirements for the Award of a Degree of Bachelor of Science in Information Technology of Kabarak University

Date of Submission: July 2025

 
 DECLARATION
I, MOSES WAMBUA, Registration Number: INTE/MG/1730/09/22, hereby declare that this Project Report titled:
“DIGITAL SOKO: A Web-Based Platform for Barter and Cash-Top-Up Item Exchange”
is my original work and has not been submitted for the award of a degree or diploma in any other institution of higher learning.
To the best of my knowledge, this report does not contain material written or published by other people, except where due reference is made in the text and bibliography.
This project has been carried out in partial fulfillment of the requirements of the Bachelor of Science in Information Technology at KABARAK UNIVERSITY.
Student’s Signature: ____________________
Date: ____________________














DEDICATION
I dedicate this project to my family and friends, whose unwavering support, encouragement, and belief in my potential have been my greatest motivation throughout this journey. Your love and understanding gave me strength every step of the way.




















ACKNOWLEDGEMENT
I would like to express my deepest gratitude to everyone who contributed to the successful completion of this project.
First and foremost, I sincerely thank my supervisor, EVANS CHESANG, for the continuous guidance, constructive feedback, and invaluable support throughout the development of this project. Your mentorship and encouragement have been essential to my growth.
I am also grateful to the lecturers and staff of Kabarak University, especially in the School of Computer Science and Information Technology, for providing the academic foundation and resources that made this work possible.
Special thanks to my family and friends, whose patience, support, and motivation kept me going even during challenging times.
I also appreciate the contributions and suggestions of my fellow students, who provided helpful feedback, shared ideas, and made this journey meaningful and collaborative.
Finally, I thank all the individuals who participated in providing insights and information that guided various aspects of this project.






Table of Contents
DEDICATION	3
ACKNOWLEDGEMENT	4
ABSTRACT	6
5.6 List of Tables	8
5.7 List of Figures	8
CHAPTER ONE	10
INTRODUCTION	10
1.1 Introduction	10
1.2 Background of the Study	10
1.3 Problem Statement	11
1.4 Objectives of the Project	11
1.5 Research Questions	12
1.6 Significance of the Study	12
1.7 Scope and Limitations of the Study	13
CHAPTER TWO: LITERATURE REVIEW	14
2.1 Introduction	14
2.2 Review of Theoretical Literature	14
2.3 Conceptual Framework	16
2.4 Research Gap – DIGITAL SOKO	17
Identified Gaps:	18
2.5 Summary	18
CHAPTER THREE: METHODOLOGY	19
3.1 Introduction	19
3.2 Research Methodology / Research Design Used	19
3.2.1 Development Methodology	20
3.3 Data Collection Methods Used	22
3.4 System Analysis and Design (SAD)	23
3.4.1 System Analysis	23
3.4.1.1 Requirements Analysis	24
3.5 Feasibility Study	28
3.6 System Modeling	29
3.5 Design Specification	35
3.6 Research Ethics	36
REFERENCES	38





ABSTRACT

This project presents DIGITAL SOKO, a hybrid web-based platform designed to facilitate trade through both barter exchange and monetary top-ups. The system addresses the limitations of conventional e-commerce platforms that solely depend on cash-based transactions, thereby excluding users with limited financial access. By integrating a barter system, DIGITAL SOKO empowers users to trade goods or services directly and only require minimal monetary compensation where value mismatches occur. The study adopted a mixed-methods approach comprising both qualitative and quantitative data collection methods, including literature reviews, interviews, and observation. The Agile methodology was employed in the system development process to ensure iterative and user-focused implementation. Functional and non-functional requirements were carefully gathered and analyzed, leading to a robust system design that incorporates features such as user profiles, item listing, smart value matching, secure messaging, and trade finalization modules. A feasibility study revealed that the platform is technically viable, economically justified, and operationally appropriate within the target communities. Key design artifacts such as Data Flow Diagrams (DFDs), Entity Relationship Diagrams (ERDs), and UML models were developed to structure the system logic and behavior. DIGITAL SOKO provides a practical, inclusive, and innovative solution to the evolving needs of digital trading, especially in regions with unequal economic capabilities. This project contributes significantly to the field of digital commerce and system design by proposing a model that blends traditional barter with modern technological infrastructure.Keywords: DIGITAL SOKO, Barter System, E-commerce, Hybrid Trading, Agile Development, Inclusive Technology

List of Abbreviations
Abbreviation	Full Meaning
API	Application Programming Interface
CRUD	Create, Read, Update, Delete
DFD	Data Flow Diagram
ERD	Entity-Relationship Diagram
HTML	HyperText Markup Language
CSS	Cascading Style Sheets
UI	User Interface
UX	User Experience
DB	Database
HTTP	Hypertext Transfer Protocol
JS	JavaScript
SQL	Structured Query Language
IDE	Integrated Development Environment
ICT	Information and Communication Technology
MVP	Minimum Viable Product
TAM	Technology Acceptance Model
DIT	Diffusion of Innovations Theory
JSON	JavaScript Object Notation
SaaS	Software as a Service
URL	Uniform Resource Locator
VS Code	Visual Studio Code
M-PESA	Mobile Money Payment System (Kenya)
DBMS	Database Management System







List of Tables
Table No.	Title	Page
Table 3.1	Agile Iteration Plan for DIGITAL SOKO Development	21
Table 3.2	Functional Requirements of DIGITAL SOKO	26
Table 3.3	Non-Functional Requirements of DIGITAL SOKO	27
Table 3.4	Use Case Description – User Item Listing (UC-01)	27
Table 3.5	Use Case Description – Barter Request (UC-02)	28
Table 3.6	Use Case Description – Admin Dispute Resolution (UC-03)	28
Table 3.7	Sample User Stories for DIGITAL SOKO	29
Table 3.8	Technical Specifications (Client and Server Requirements)	34
Table 3.9	Software Tools and Technologies Used	35
Table 3.10	Estimated Economic Cost for Platform Development and Operation
	














List of Figures
Figure No.	Title	Page
Figure 2.1	Conceptual Framework of DIGITAL SOKO	16
Figure 3.1	System Development Iteration Plan (Agile Model)	21
Figure 3.2	Level 0 Data Flow Diagram (DFD) for DIGITAL SOKO	32
Figure 3.3	Level 1 Data Flow Diagram (DFD) for DIGITAL SOKO	33
Figure 3.4	Entity-Relationship Diagram (ERD) for DIGITAL SOKO	34
Figure 3.5	Sequence Diagram of the Barter Transaction Process	35
Figure 3.6	System Architecture Diagram for DIGITAL SOKO	36
Figure 3.7	User Interface Wireframes / Prototypes (Login, Dashboard, Item Listing)	

 
CHAPTER ONE
INTRODUCTION
1.1 Introduction
The rapid advancement of digital technology has transformed the way individuals buy, sell, and exchange goods. Traditional marketplaces have evolved into dynamic e-commerce platforms, offering users convenience, flexibility, and access to a wider audience. However, many of these platforms are primarily cash-based, leaving out individuals who might possess tradable goods but lack immediate financial resources.
DIGITAL SOKO is a web-based solution designed to address this gap by introducing a hybrid exchange model that integrates bartering and cash-top-up mechanisms. The platform allows users to list items they wish to exchange, propose trade offers, and optionally top up with a small amount of money when the perceived value between items differs. This approach not only promotes sustainable consumption and digital inclusion but also offers an innovative solution for users who may not always rely on direct cash transactions.
This chapter introduces the core concept of the project, outlines the motivation behind its development, and explains the objectives, problem context, scope, and importance of the study.
1.2 Background of the Study
The emergence of e-commerce has reshaped trade dynamics globally, allowing individuals and businesses to buy and sell goods conveniently through digital platforms. However, in many developing regions, including Kenya, a significant portion of the population still struggles with direct cash purchases due to limited financial resources, lack of access to digital payment systems, or inconsistent income flows. This has created a digital divide, excluding a potential group of users from participating meaningfully in mainstream online marketplaces.
At the same time, bartering the age-old practice of trading goods without using money remains informally active in many communities. People often exchange personal items, services, or skills to meet their needs without spending cash. Unfortunately, these transactions are typically unstructured, localized, and lack the reach and security of formal digital platforms.
DIGITAL SOKO aims to bridge this gap by introducing a structured online platform that blends the benefits of modern e-commerce with the practicality of bartering. The platform enables users to list items they no longer need and engage in item-for-item exchanges, with the added option of topping up a cash balance when items are of unequal value. This hybrid model not only empowers users with limited cash flow but also promotes sustainability through reuse and recycling of goods.
The intended beneficiaries of DIGITAL SOKO include small-scale traders, students, and low-income earners particularly those in rural or peri-urban areas who seek alternatives to rigid cash-based marketplaces. Currently, such individuals rely on informal word-of-mouth exchanges, social media groups, or physical market stalls that often limit their reach, security, and fairness in value matching. The proposed system offers a digital transformation of these practices by automating valuation gaps, improving transaction transparency, and enhancing trust among users through verification and ratings.
This project is therefore a response to both economic necessity and digital innovation, providing an inclusive, scalable, and community-driven platform for goods exchange.
1.3 Problem Statement
In many communities, especially within low-income and informal sectors, individuals often possess items they no longer need but lack access to reliable platforms for exchanging them. Traditional online marketplaces and classified websites such as Jiji or Facebook Marketplace operate primarily on direct cash transactions. This excludes users who may not have the financial means to buy new items but have goods of value they can trade. As a result, there is a missed opportunity to promote fair, value-based exchanges that are more accessible and inclusive.
Currently, people who wish to barter must rely on unregulated and informal channels such as social media groups, local bulletin boards, or word-of-mouth exchanges. These methods are disorganized, have limited reach, and lack trust mechanisms leading to problems such as fraud, mismatched value expectations, and failed exchanges. Users have no structured way to assess the fairness of a trade, track previous transactions, or resolve disputes.
Furthermore, in cases where two parties agree to trade but one item is of significantly higher value than the other, the lack of a top-up mechanism often stalls the transaction. There is no standard method to determine the value difference or facilitate partial payment, leading to missed opportunities for otherwise successful trades.
The absence of a hybrid platform that integrates bartering with a flexible cash-top-up option, combined with the lack of user verification, digital item listings, and value balancing tools, highlights the core problem this project seeks to address. DIGITAL SOKO is therefore proposed to solve these challenges by offering a structured, secure, and accessible platform that empowers users to exchange goods fairly, even when cash is limited.
1.4 Objectives of the Project
1.4.1 Main Objective
To develop a web-based platform that enables users to exchange goods through a structured barter system with an optional cash-top-up feature, aimed at increasing access to e-commerce for individuals with limited financial resources.
1.4.2 Specific Objectives
i. To investigate the current challenges and limitations of existing barter and resale platforms, particularly in handling unequal-value item exchanges.
ii. To design a system architecture for DIGITAL SOKO that supports item listing, user verification, barter exchange, and top-up payment functionality.
iii. To develop a functional prototype of the DIGITAL SOKO platform using appropriate web technologies.
iv. To test the system on a local server and evaluate its usability, functionality, and security through feedback from selected users.
1.5 Research Questions
i. What are the key challenges and limitations faced by existing barter and resale platforms in managing unequal-value item exchanges?
ii. How can a web-based system be designed to support secure item listings, user verification, barter exchanges, and a cash-top-up mechanism?
iii. What are the most effective technologies and tools to be used in developing a functional prototype of the DIGITAL SOKO platform?
iv. How effective and user-friendly is the deployed DIGITAL SOKO platform in facilitating item exchanges and improving user trust and accessibility?
1.6 Significance of the Study
The development of DIGITAL SOKO presents a timely and innovative solution to the growing need for inclusive, flexible, and resource-conscious trading platforms. In an economic environment where many individuals face financial limitations, a system that combines traditional bartering with modern e-commerce provides a unique opportunity to participate in digital trade without relying solely on cash.
This project is significant because it addresses real-world challenges , including digital exclusion, limited financial liquidity, and the undervaluation of goods in informal trade settings. By enabling users to exchange items with an optional cash top-up, DIGITAL SOKO introduces a fairer, more sustainable, and accessible alternative to conventional online marketplaces.
The project is also technically interesting and challenging. It involves designing a system that integrates multiple complex components such as item valuation, matching logic, user authentication, and payment handling into a seamless and secure platform. This offers the developer practical experience in full-stack web development, user-centered design, and system deployment.
Furthermore, the study contributes to knowledge in the field of digital innovation by proposing a hybrid barter-cash model that can be scaled and adapted in other regions facing similar economic constraints. The realization of DIGITAL SOKO has the potential to benefit small-scale traders, students, and low-income earners by empowering them to derive value from unused goods while minimizing dependency on cash.
1.7 Scope and Limitations of the Study
Scope of the Study
This study focuses on the design, development, and evaluation of DIGITAL SOKO, a web-based platform that enables users to exchange goods through a hybrid barter and cash-top-up model. The scope includes:
•	System Development Scope: The project will cover the core functionalities of the platform, including user registration and login, item listing, barter proposals, automated top-up calculations, transaction history tracking, and basic user verification.
•	Research Boundaries: The study will investigate current challenges in online bartering systems, user behavior in informal exchange networks, and the feasibility of integrating a hybrid exchange model into a digital platform.
•	Timeframe: The project is designed to be completed within one academic semester, covering the phases of research, system design, development, testing, and documentation.
•	Geographical Scope: The system is initially targeted for users in Kenya, especially in urban and peri-urban areas where access to digital devices exists but financial constraints hinder full e-commerce participation. However, the platform design will allow scalability to other regions.
Limitations of the Study
Despite its innovative approach, the study is subject to several limitations:
•	Resource Constraints: Due to limited funding and infrastructure, the project will be developed and tested on a small scale with a limited number of users.
•	Time Constraints: Given the fixed academic calendar, full-scale deployment and real-world integration of payment systems (e.g., mobile money) will be limited to a basic demonstration.
•	User Behavior: The study assumes users will act in good faith when listing items and proposing trades. Real-world complications such as fraud, disputes, and item misrepresentation are acknowledged but only partially addressed within the scope.
•	Technology Access: The effectiveness of the platform is influenced by users’ access to the internet and digital devices, which may not be uniform across all target regions.




CHAPTER TWO
LITERATURE REVIEW
2.1 Introduction
This chapter provides a comprehensive review of the existing literature relevant to the development of digital marketplaces and barter systems. The purpose of the literature review is to explore prior research, theories, models, and applications that inform the design and implementation of DIGITAL SOKO a platform aimed at facilitating both barter trade and cash top-up transactions. The review covers key themes such as e-commerce platforms, digital barter systems, online marketplaces in Kenya and beyond, user experience in web platforms, and system security measures.
By examining existing systems and scholarly works, this chapter aims to:
•	Identify gaps in current marketplace platforms that DIGITAL SOKO intends to address,
•	Establish the theoretical and technical foundation of the project,
•	Provide insights into technologies and methodologies used in similar systems,
•	Justify the need for a hybrid barter-cash digital solution in a localized context.
The chapter is organized into several sections covering related work, theoretical frameworks, relevant technologies, and comparative analysis with existing platforms. The goal is to demonstrate how DIGITAL SOKO fits into the broader ecosystem of online trading platforms while addressing unmet needs in informal economies.
2.2 Review of Theoretical Literature
The development of DIGITAL SOKO is anchored in several theoretical frameworks that guide the design, functionality, and relevance of the system in a real-world context. These theories provide a lens for understanding user behavior, system adoption, and the economic principles behind barter and digital commerce. The following are the key theories reviewed in relation to this project:

2.2.1 Barter Exchange Theory
The Barter Exchange Theory emphasizes the direct exchange of goods and services without the use of money. It traces back to pre-monetary economies, where individuals traded based on mutual need. This theory is relevant to DIGITAL SOKO’s core function, which allows users to exchange items directly, with or without a cash top-up. The system leverages the principle of perceived value and fair exchange, addressing modern needs through digital tools (Source: Humphrey, C. (1985). Barter and economic disintegration. Man, 20(1), 48–72.).

2.2.2 Technology Acceptance Model (TAM)
The Technology Acceptance Model explains how users come to accept and use a new technology. TAM focuses on two main factors:
•	Perceived Usefulness – how well users believe the system enhances their productivity or solves a problem.
•	Perceived Ease of Use – how effortless users feel it is to interact with the platform.
DIGITAL SOKO’s user interface and feature design are built with these principles to ensure fast adoption and continued use among individuals with varying levels of tech literacy.( Source: Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340.)


2.2.3 Diffusion of Innovations Theory
Proposed by Everett Rogers, this theory explains how, why, and at what rate new ideas and technology spread through cultures. The five stages — Innovators, Early Adopters, Early Majority, Late Majority, and Laggards — inform the system’s promotion strategy and development roadmap. For DIGITAL SOKO, this theory supports gradual rollout and user onboarding strategies, particularly within informal market communities.( Source: Rogers, E. M. (2003). Diffusion of Innovations (5th ed.). New York: Free Press.)


2.2.4 Network Theory
Network theory explores how people, systems, and information are interconnected. DIGITAL SOKO aims to build a digital marketplace that thrives on user-to-user interactions. The barter model heavily relies on the structure and strength of the user network. This theory supports features like community ratings, referrals, and item visibility across social nodes. (Source: Newman, M. E. J. (2010). Networks: An Introduction. Oxford: Oxford University Press.)

2.2.5 Value Exchange Theory
This theory asserts that transactions occur when the perceived value offered by one party matches or exceeds the value expected by the other. In a barter-driven system, understanding this balance is critical. DIGITAL SOKO applies this by integrating item comparisons, optional cash top-ups, and user-negotiation features to balance value between parties.(Source: Zeithaml, V. A. (1988). Consumer perceptions of price, quality, and value: A means-end model and synthesis of evidence. Journal of Marketing, 52(3), 2–22.)
2.3 Conceptual Framework
The conceptual framework serves as the foundation for understanding the key components of the DIGITAL SOKO system and how they interact to achieve the project’s objectives. It provides a structured view of the variables involved, their relationships, and the flow of inputs, processes, and outcomes in the barter-and-cash-based e-commerce model.
Key Variables:
1.	Independent Variables:
o	User registration and authentication
o	Product listing and categorization
o	Barter request and match system
o	Optional cash top-up mechanism
2.	Intervening Variables:
o	System usability and interface design
o	Internet access and device compatibility
o	User trust and platform security
o	Awareness and digital literacy levels
3.	Dependent Variables:
o	User satisfaction
o	Transaction success rate
o	Platform adoption and retention
o	Economic empowerment through trade

 
 
2.4 Research Gap – DIGITAL SOKO
Despite the growing use of e-commerce platforms in Kenya and other parts of Africa, significant gaps remain in meeting the unique needs of users seeking barter-based trade options, especially in low-income or digitally underserved areas. The research gap in the DIGITAL SOKO system lies in the intersection of bartering, optional cash top-ups, and digital inclusion.

 Identified Gaps:
1.	Lack of Hybrid Barter-and-Cash Platforms:
o	Most e-commerce platforms focus solely on monetary transactions.
o	Bartering features are either missing or poorly integrated.
2.	Low Inclusion of Unbanked or Digitally Marginalized Users:
o	Many platforms do not cater to users with limited internet access, digital literacy, or no access to mobile money/banking.
o	This excludes a large portion of rural or informal traders.
3.	Inadequate User Trust & Security Mechanisms in Barter:
o	Users hesitate to engage in barter trades due to a lack of transparency, fraud protection, and identity verification.
4.	Limited Personalization and Matchmaking in Barter Systems:
o	Few systems offer intelligent or automated item match suggestions.
o	Users must manually search, which leads to low conversion or trade rates.
5.	Under-researched Impact of Barter on Economic Empowerment:
o	While anecdotal evidence suggests barter may boost livelihoods, few empirical studies exist on its effectiveness in digital contexts.
2.5 Summary
This chapter has provided a comprehensive review of relevant literature guiding the development and implementation of the DIGITAL SOKO platform. The theoretical literature outlined the foundational concepts in e-commerce, digital marketplaces, and barter trade, offering insight into the feasibility of integrating traditional trade mechanisms with modern technologies. The review highlighted how various scholars and previous studies have addressed the issues of user trust, trade fairness, and value matching in peer-to-peer platforms.
The conceptual framework presented in this chapter has mapped out the key components and their interactions in the proposed system. It illustrates how user engagement, system functionality, and trade dynamics collectively contribute to achieving the overall objective — enabling a hybrid barter-and-cash platform that fosters equitable and convenient trade among users.
By anchoring the study within a solid theoretical and conceptual background, this chapter sets the stage for the next phase, where research methodology and system design are outlined. This transition ensures that the development of DIGITAL SOKO is not only grounded in relevant academic discourse but also guided by clear, structured logic.
 

CHAPTER THREE
METHODOLOGY
3.1 Introduction
This chapter presents the methodology adopted in conducting the study and developing the DIGITAL SOKO platform. It outlines the research design used, the target population, sampling methods, data collection procedures, data analysis techniques, system development methodology, and ethical considerations. The aim of this chapter is to ensure transparency and reproducibility by clearly explaining how data was gathered, analyzed, and applied in system development.
3.2 Research Methodology / Research Design Used
The study adopted a mixed-methods research design, combining both quantitative and qualitative approaches. This integration was necessary to capture both measurable patterns in user behavior and deeper insights into the experiences, motivations, and challenges faced by individuals involved in item trading or bartering.
•	The quantitative approach involved structured surveys distributed to potential users of the DIGITAL SOKO platform, aiming to collect data on trading frequency, item categories, access to online tools, and preferred exchange models.
•	The qualitative approach consisted of interviews and informal discussions with a smaller sample of users and local traders. These sessions helped the researcher understand practical issues in current barter practices, user trust dynamics, and the acceptability of a hybrid cash-top-up model.
This mixed design was selected because it supports both the analytical rigor needed to validate the platform’s relevance and the user-centered design philosophy behind its development.
The dual focus also allows the study to bridge theoretical research with practical system implementation, ensuring that DIGITAL SOKO is not only functional but also addresses real-world needs.




3.2.1 Development Methodology
Development Approach
The development of the DIGITAL SOKO platform adopted the Agile Software Development Methodology. Agile is an iterative and incremental approach that emphasizes flexibility, customer collaboration, and frequent delivery of functional components. This methodology was chosen because it aligns well with the project's goals and structure:
•	Flexibility: DIGITAL SOKO is a user-centered platform that may require constant changes and improvements based on user feedback during development. Agile allows for continuous adjustments.
•	Project Size: The scope of the platform is moderate and manageable in short cycles, making it ideal for Agile's sprint-based planning.
•	Faster Deliverables: Agile supports early deployment of working modules (e.g., item listing, barter module, user profiles), enabling the researcher to test functionality and gather feedback before final integration.
•	Collaboration: Agile fosters continuous collaboration between the developer, supervisor, and target users—ensuring that all functional and non-functional requirements are well understood and implemented.
Iterative Processes
The system was developed in four main sprints (iterations), each lasting approximately two weeks:
 
•	Iteration 1: Requirements Gathering and Planning
o	Activities: Stakeholder interviews, user surveys, and creation of user stories.
o	Deliverables: Requirement documentation, system use cases, and initial design wireframes.
•	Iteration 2: Front-End and Back-End Setup
o	Activities: UI/UX design, basic front-end development (HTML/CSS/JavaScript), and back-end setup (e.g., database, APIs).
o	Deliverables: Working login/registration module, user dashboard, and item listing page.
•	Iteration 3: Core Feature Implementation
o	Activities: Development of barter match logic, top-up calculator, and user-item exchange interface.
o	Deliverables: Functional exchange engine, top-up calculation module, and item-value comparison tools.
•	Iteration 4: Testing and Deployment
o	Activities: Usability testing, bug fixing, feedback collection, and documentation.
o	Deliverables: Final prototype deployed on a local server, complete system report, and user guide.
Each iteration builds on the previous one and moves the system closer to the final product, ensuring that user feedback is integrated continuously and that the end system meets both technical and user requirements.
3.3 Data Collection Methods Used
Given the time constraints and scope of this project, secondary data formed the primary basis for data collection. Secondary data refers to information that has already been collected and published by other researchers, organizations, or digital platforms. This method was chosen for its reliability, cost-effectiveness, and relevance to the project's objectives.
Sources of Secondary Data:
1.	Academic journals and articles: Research papers on e-commerce, digital bartering, and hybrid marketplace models were reviewed to understand current trends and identify gaps in existing systems.
2.	Government and NGO reports: Reports on digital access, financial inclusion, and mobile money usage in Kenya were analyzed to determine the viability and relevance of a hybrid barter-cash platform in the local context.
3.	Existing platform analysis: Online platforms such as Jiji, OLX, and Facebook Marketplace were evaluated to examine their limitations regarding item-for-item exchanges and user trust mechanisms.
4.	Case studies and technical blogs: Case studies from developers and startups working on barter and second-hand trading platforms were reviewed to gather insights on common system architecture patterns and user interaction models.
Tools and Techniques Used:
•	Desktop research: Comprehensive internet-based research was used to gather and organize secondary data from credible websites and digital libraries.
•	Document analysis: Key documents, reports, and published statistics were studied, categorized, and referenced in both the literature review and system design justifications.
•	Comparative analysis framework: A comparison grid was developed to highlight feature gaps in existing platforms, helping justify the need for DIGITAL SOKO and shape system requirements.
3.4 System Analysis and Design (SAD)
System Analysis and Design (SAD) plays a pivotal role in the development of the DIGITAL SOKO platform. This phase involves evaluating user requirements, identifying system functionalities, modeling data and processes, and designing a blueprint that defines how the final system will operate and be built. The aim is to ensure that the system is both technically sound and aligned with user needs.
3.4.1 System Analysis
System analysis is a fundamental phase in the development of the DIGITAL SOKO platform. It involves a structured examination of user needs and existing systems to define the system’s functional and non-functional requirements. The goal of this phase is to ensure that the proposed system addresses real-world problems, aligns with stakeholder expectations, and lays a solid foundation for system design and development.
Requirements Gathering
To understand the exact needs of potential users and define the functional scope of the system, various methods were employed:
•	Interviews: Informal interviews were conducted with small-scale traders, second-hand item sellers, and tech-savvy individuals who frequently use online marketplaces. These interviews provided insights into the difficulties faced during traditional barter trade and highlighted the limitations of existing platforms.
•	Surveys and Questionnaires: Online surveys were distributed among university students and community groups to collect opinions on the use of a combined barter and cash-top-up system. The responses showed that many people were interested in exchanging items but lacked a structured, trusted platform.
•	Observation: Observation of user behavior on popular platforms like Facebook Marketplace and Jiji revealed common issues such as unverified users, lack of fair valuation, and difficulty in proposing partial trades.
•	Document Analysis: Existing literature on online trading systems, barter platforms, and user feedback reports from similar systems were reviewed to understand common design pitfalls and to benchmark system requirements.
Functional Requirements Identified
1.	User registration and login system with secure authentication.
2.	Listing items with clear descriptions, images, and barter preferences.
3.	Matching engine to suggest possible item exchanges with or without cash top-up.
4.	Messaging feature for users to negotiate and finalize trades.
5.	Admin dashboard for user, item, and complaint management.
6.	Notification system for trade offers and status updates.
Non-Functional Requirements
1.	Usability: The platform should be easy to navigate for all user types, including first-time traders.
2.	Performance: The system should respond quickly to user requests, even under moderate load.
3.	Security: All user data should be protected with encryption, and trade verification should be in place to prevent fraud.
4.	Scalability: The platform should support future expansion such as delivery options or mobile payment integration.
3.4.1.1 Requirements Analysis
A thorough analysis of requirements was conducted to ensure that the DIGITAL SOKO platform meets the needs of its intended users. This section outlines the functional and non-functional requirements, as well as use cases and user stories that guide the development of the system.
________________________________________
Functional Requirements
These define what the system should do:
1.	User Registration and Login
o	Users should be able to register using email or phone number and log in securely.
2.	Profile Management
o	Users can edit personal details and view their listed or exchanged items.
3.	Item Listing and Search
o	Users should be able to post items with descriptions, images, and preferred exchange items or price top-ups.
o	Users should be able to search and filter items by category, condition, or location.
4.	Barter Request System
o	Users can send barter requests to other users, proposing item-for-item trades or item-plus-cash top-ups.
5.	Chat and Negotiation
o	A messaging system should enable users to communicate and negotiate barter deals.
6.	Exchange Confirmation and Review
o	Once an exchange is agreed upon, both parties should confirm the deal and optionally rate each other.
7.	Admin Panel
o	Admins should be able to manage users, monitor item listings, and resolve disputes.



Non-Functional Requirements
These define how the system should perform:
1.	Performance
o	The platform must handle up to 100 concurrent users without significant lag.
2.	Security
o	Passwords must be encrypted; user input should be sanitized to prevent injection attacks.
3.	Usability
o	The interface must be user-friendly and mobile-responsive.
4.	Availability
o	The system should be accessible 24/7 with minimal downtime.
5.	Scalability
o	Should be able to support additional features like delivery integration in the future.
________________________________________
Use Cases
Here are three primary use cases for DIGITAL SOKO:
Use Case ID	UC-01
Title	User Item Listing
Actor	Registered User
Description	A user logs in, navigates to “Post Item,” uploads item images, fills in details, and posts it.
Precondition	User must be logged in.
Postcondition	Item appears in the marketplace.
________________________________________
Use Case ID	UC-02
Title	Barter Request
Actor	Registered User
Description	A user views another user’s item and proposes an exchange from their own listed items or adds cash top-up.
Precondition	Both users must have at least one item listed.
Postcondition	Notification is sent to the recipient for approval.
________________________________________
Use Case ID	UC-03
Title	Admin Dispute Resolution
Actor	Admin
Description	Admin receives a complaint, reviews both users' listings and chats, then takes action (e.g., warning, removal).
Precondition	A complaint must be submitted by a user.
Postcondition	The dispute is marked resolved or escalated.

User Stories
•	As a user, I want to list an item with images and price/barter preferences so that others can view and offer a trade.
•	As a user, I want to receive notifications when someone proposes an exchange for my item so I can respond quickly.
•	As a user, I want to chat with potential traders to negotiate terms before confirming the exchange.
•	As an admin, I want to monitor listings and handle user complaints so the platform remains safe and trustworthy.
 
3.5 Feasibility Study
A feasibility study was conducted to evaluate whether the DIGITAL SOKO system can be successfully developed and implemented. The feasibility is assessed in terms of technical, economic, and operational aspects.

3.5.1 Technical Feasibility
The technologies required for the development and deployment of the DIGITAL SOKO platform are readily available and widely supported. These include:
•	Frontend: HTML, CSS, JavaScript, React.js (or Vue.js)
•	Backend: Node.js with Express.js / Django (Python)
•	Database: MySQL or PostgreSQL
•	Hosting: Cloud-based services like AWS, Firebase, or Render
•	Development Tools: GitHub, Visual Studio Code, Figma for UI prototyping
Given the student developer's familiarity with these technologies and the availability of necessary tools and resources, the project is technically feasible.

3.5.2 Economic Feasibility
The economic feasibility assesses the cost-benefit balance of the project:
•	Estimated Costs:
o	Domain and Hosting: Ksh 2,500 – 5,000 per year
o	Internet Access: Ksh 1,000 per month
o	Power/Backup Costs: Ksh 500 per month (if applicable)
o	Miscellaneous (e.g., cloud tools, test devices): ~Ksh 3,000 (one-time)
•	Benefits:
o	Free platform for local users to exchange goods affordably
o	Minimal entry barrier for users without cash
o	Potential future revenue through premium listings or ads
Considering the low initial cost and high social value, the system is economically feasible.

3.5.3 Operational Feasibility
The system will be implemented in a user-friendly environment, accessible via mobile phones and desktop browsers. It is designed to operate smoothly within the Kenyan context where barter trade is culturally acceptable and smartphones are widely used.
Stakeholders including students, vendors, and local communities are likely to adopt the system because:
•	It simplifies item exchange
•	It encourages trust through chat and rating features
•	It integrates both barter and cash flexibility
Hence, it is operationally feasible.
3.6 System Modeling
System modeling visually and logically represents the behavior, structure, and data of the DIGITAL SOKO system.

3.6.1 Data Flow Diagrams (DFDs)
•	Level 0 DFD: Shows the general flow of data from users to the system and back.
o	External Entities: User, Admin
o	Processes: User Registration, Item Listing, Barter Proposal, Admin Management
o	Data Stores: User DB, Item DB, Chat Logs
•	Level 1 DFD: Breaks down internal processes (e.g., item listing → add image, set price, post)

Items 4.3 Manage Users Data Stores: User DB Item DB  
 
LEVEL 0
  
3.6.2 Entity-Relationship Diagram (ERD)
Entities and Attributes:
•	User: User_ID, Name, Email, Password, Phone, Location
•	Item: Item_ID, Title, Description, Condition, Owner_ID (FK), Image
•	Barter_Request: Request_ID, Offered_Item_ID, Desired_Item_ID, Status, Message
•	Chat: Chat_ID, Sender_ID, Receiver_ID, Message, Timestamp
•	Admin: Admin_ID, Name, Email, Role
Relationships:
•	One User → Many Items
•	One Item → Many Barter_Requests
•	One Barter_Request → One Chat (optional)
•	Sequence Diagram: Models user actions like: Login → Search Item → Send Barter Request → Chat → Confirm Exchange create image
 

: 








SEQUENCE DIAGRAM
Models user actions like: Login → Search Item → Send Barter Request → Chat → Confirm Exchange create image 

 
3.5 Design Specification
3.5.1 Technical Specifications
The design of DIGITAL SOKO is guided by the need for reliability, scalability, and user-friendliness. The system is intended to function as a web-based platform facilitating barter-and-cash trade transactions. Below are the technical specifications required for the system:
Hardware Requirements:
•	Client Side:
o	Processor: Dual-core 2.0 GHz or higher
o	RAM: Minimum 4 GB
o	Storage: 20 GB free disk space
o	Display: 1024x768 resolution or higher
•	Server Side:
o	Processor: Quad-core 2.4 GHz or higher
o	RAM: Minimum 8 GB
o	Storage: 100 GB SSD
o	Internet: Reliable broadband connection with at least 5 Mbps upload/download
Software Requirements:
1.	Front-End: HTML5, CSS3, JavaScript, React.js
2.	Back-End: Node.js / Express.js
3.	Database: MongoDB or MySQL
4.	Operating System: Ubuntu 20.04 LTS (server), Windows/Linux/macOS (client)
5.	Web Server: Apache or NGINX
6.	Development Tools: VS Code, Git, Postman
7.	Other Tools: Firebase (for notifications), Stripe API or M-Pesa API (for payments), GitHub (version control)
8.	________________________________________
3.5.2 Design Documents
The system design includes various structured documents and visual diagrams representing the logical and physical components of DIGITAL SOKO.
1.	System Architecture Diagram: Illustrates the tiered structure including client interface, web server, API layer, and database backend.
2.	ERD (Entity-Relationship Diagram): Defines the relationships between users, items, barter transactions, payments, and feedback.
3.	Data Flow Diagrams (Level 0 and Level 1): Show how data moves through the system, including login, item listing, offer matching, and payment.
4.	UML Diagrams: Class diagrams, activity diagrams, and sequence diagrams are used to model component interactions, workflows, and system behavior.
These documents ensure that every module of the platform—such as user registration, product listing, offer matching, negotiation, and confirmation—has a clearly defined functionality and structure.

3.5.3 Review and Validation
Design Review:
Periodic design review sessions were conducted involving stakeholders (students, supervisors, potential users) to critique the system's architecture and UI/UX layout. Feedback from these reviews was used to refine design aspects to align with user expectations and usability principles.
Validation:
The design was validated by mapping each component to the documented system requirements:
1.	Functional requirements were cross-checked with corresponding use cases and interface components.
2.	athrough simulated environments and prototype walkthroughs.
3.	Design prototypes were reviewed for consistency, error handling, and responsiveness across multiple devices.
3.6 Research Ethics
Ethical considerations are crucial in any research involving human participants to ensure the integrity, credibility, and acceptability of the study. The DIGITAL SOKO project adheres to standard ethical practices during data collection, analysis, and system testing phases, particularly since it involves interactions with potential users (vendors, buyers, and administrators). The following ethical measures will be observed:
Confidentiality
All information provided by participants during interviews, surveys, or system testing will be kept strictly confidential. Data will be stored in secure, password-protected systems, and only authorized project team members will have access. Identifiable personal data such as names, contact information, and transaction history will not be shared or published without consent.
Anonymity
Participants will remain anonymous in all research reports and presentations. Identifying features such as names or specific business identities will not be disclosed. Data analysis will focus on generalized results rather than individual responses.
Informed Consent
Before participating in the study, individuals will be informed about:
•	The purpose and goals of the study
•	The type of data being collected and how it will be used
•	Their right to withdraw from the study at any time without penalty
Written or digital consent will be sought before any data is collected, especially during interviews or usability testing.
Voluntary Participation
Participation in the research will be completely voluntary. There will be no coercion or pressure applied to persuade individuals to contribute to the study. Every participant will be allowed to refuse to answer any question they are uncomfortable with.
Data Protection
All data collected will be handled in compliance with data protection principles. This includes safe storage, encrypted backups, and secure deletion once the project is complete or once data is no longer needed.










REFERENCES
1.	Abdullahi, M., & Kamal, M. (2022). Design and Implementation of Online Market Platforms in Developing Economies. International Journal of Computer Applications, 179(9), 24–30. https://doi.org/10.5120/ijca2022912345
2.	Dennis, A., Wixom, B. H., & Tegarden, D. (2015). Systems Analysis and Design: An Object-Oriented Approach with UML (5th ed.). Wiley.
3.	Laudon, K. C., & Laudon, J. P. (2020). Management Information Systems: Managing the Digital Firm (16th ed.). Pearson Education.
4.	O'Brien, J. A., & Marakas, G. M. (2011). Introduction to Information Systems (15th ed.). McGraw-Hill Education.
5.	Schwalbe, K. (2015). Information Technology Project Management (8th ed.). Cengage Learning.
6.	Somerville, I. (2016). Software Engineering (10th ed.). Pearson.
7.	Turban, E., Volonino, L., & Wood, G. (2015). Information Technology for Management: Advancing Sustainable, Profitable Business Growth (10th ed.). Wiley.

