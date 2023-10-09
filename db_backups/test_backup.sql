--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5
-- Dumped by pg_dump version 14.5

-- Started on 2022-10-12 17:47:56

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16654)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3360 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16649)
-- Name: connections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connections (
    user_id bigint,
    session uuid
);


ALTER TABLE public.connections OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16637)
-- Name: groupmembers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groupmembers (
    user_id bigint,
    group_id bigint,
    role_prior smallint
);


ALTER TABLE public.groupmembers OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16627)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    group_id bigint NOT NULL,
    "timestamp" timestamp without time zone,
    name text,
    description text
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 16626)
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_group_id_seq OWNER TO postgres;

--
-- TOC entry 3361 (class 0 OID 0)
-- Dependencies: 212
-- Name: groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_group_id_seq OWNED BY public.groups.group_id;


--
-- TOC entry 216 (class 1259 OID 16641)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    author_id bigint,
    content text,
    "timestamp" timestamp without time zone,
    group_id bigint,
    message_id bigint NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16640)
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_message_id_seq OWNER TO postgres;

--
-- TOC entry 3362 (class 0 OID 0)
-- Dependencies: 215
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- TOC entry 211 (class 1259 OID 16616)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    "timestamp" timestamp without time zone,
    admin boolean,
    email text,
    password text,
    nickname text,
    phone_number text,
    telegram text,
    user_description text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 16615)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 3363 (class 0 OID 0)
-- Dependencies: 210
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3194 (class 2604 OID 16630)
-- Name: groups group_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN group_id SET DEFAULT nextval('public.groups_group_id_seq'::regclass);


--
-- TOC entry 3195 (class 2604 OID 16644)
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- TOC entry 3193 (class 2604 OID 16619)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3354 (class 0 OID 16649)
-- Dependencies: 217
-- Data for Name: connections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.connections (user_id, session) FROM stdin;
1	b4799606-57fd-49cb-b0a6-a104374dcace
\.


--
-- TOC entry 3351 (class 0 OID 16637)
-- Dependencies: 214
-- Data for Name: groupmembers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groupmembers (user_id, group_id, role_prior) FROM stdin;
\.


--
-- TOC entry 3350 (class 0 OID 16627)
-- Dependencies: 213
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (group_id, "timestamp", name, description) FROM stdin;
1	2022-10-11 23:59:34	Яблоко	Я́блоко — сочный плод яблони, который употребляется в пищу в свежем и запеченном виде, служит сырьём в кулинарии и для приготовления напитков. Наибольшее распространение получила яблоня домашняя, реже выращивают яблоню сливолистную. Размер красных, зелёных или жёлтых шаровидных плодов 5—13 см в диаметре. Происходит из Центральной Азии, где до сих пор произрастает дикорастущий предок яблони домашней — яблоня Сиверса[1]. На сегодняшний день существует множество сортов этого вида яблони, произрастающих в различных климатических условиях. По времени созревания отличают летние, осенние и зимние сорта, более поздние сорта отличаются хорошей стойкостью.\n    Русское слово яблоко возникло в результате прибавления протетического начального «j» к праслав. *ablъko; последнее образовано с помощью суффикса -ъk — от позднепраиндоевропейской основы *āblu — «яблоко» (к той же основе восходят лит. obuolỹs, латыш. ābols, англ. apple, нем. Apfel, галльск. avallo, др.‑ирл. aball[2][3]). Данная основа представляет собой регионализм северо-западных индоевропейских языков и восходит, в свою очередь, к общеиндоевропейской основе (реконструируемой как *(a)masl-[4] или как *ŝamlu-[3]). С суффиксом -onь- та же основа дала яблонь (позднейшее яблоня)[5].\n\nЛатинские слова mālum «яблоко» и mālus «яблоня» также восходят к пра-и.е. *(a)masl-/*ŝamlu-[4].
\.


--
-- TOC entry 3353 (class 0 OID 16641)
-- Dependencies: 216
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (author_id, content, "timestamp", group_id, message_id) FROM stdin;
\.


--
-- TOC entry 3348 (class 0 OID 16616)
-- Dependencies: 211
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, "timestamp", admin, email, password, nickname, phone_number, telegram, user_description) FROM stdin;
1	2022-10-10 09:20:23	f	danstolyarov79@gmail.com	20040702Lfybbk	Даниил	89876735381	telegram)	empty
\.


--
-- TOC entry 3364 (class 0 OID 0)
-- Dependencies: 212
-- Name: groups_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_group_id_seq', 2, true);


--
-- TOC entry 3365 (class 0 OID 0)
-- Dependencies: 215
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_message_id_seq', 1, false);


--
-- TOC entry 3366 (class 0 OID 0)
-- Dependencies: 210
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- TOC entry 3207 (class 2606 OID 16653)
-- Name: connections connections_session_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_session_key UNIQUE (session);


--
-- TOC entry 3201 (class 2606 OID 16636)
-- Name: groups groups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_name_key UNIQUE (name);


--
-- TOC entry 3203 (class 2606 OID 16634)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- TOC entry 3205 (class 2606 OID 16648)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- TOC entry 3197 (class 2606 OID 16625)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3199 (class 2606 OID 16623)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


-- Completed on 2022-10-12 17:47:56

--
-- PostgreSQL database dump complete
--

