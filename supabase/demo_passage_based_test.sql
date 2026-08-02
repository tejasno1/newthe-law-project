-- ── Demo: CLAT UG 2026 Style Passage-Based Test ──────────────────────────────
-- Run this AFTER running passage_based_schema.sql
-- This creates one sample passage-based test with 3 passages (15 questions)

-- ── Step 1: Insert the test ───────────────────────────────────────────────────

INSERT INTO mock_tests (
  slug, title, section, category,
  duration_minutes, total_questions, total_marks,
  attempted_label, language, difficulty,
  recent_attempt_line, marks_per_correct, negative_mark,
  is_free, price, test_type, questions
) VALUES (
  'clat-2026-english-sample',
  'CLAT 2026 English Language Sample',
  'CLAT UG',
  'English Language',
  40,
  15,
  15,
  '0 Attempts',
  'English',
  'MEDIUM',
  'New test — be the first to attempt!',
  1,
  0.25,
  true,
  0,
  'passage_based',
  '[]'
) ON CONFLICT (slug) DO NOTHING;


-- ── Step 2: Insert passages ───────────────────────────────────────────────────

-- Passage I: Non-Cooperation Movement
INSERT INTO passages (test_slug, passage_number, title, text, source) VALUES (
  'clat-2026-english-sample',
  1,
  'Non-Cooperation Movement',
  'The adoption of the Non-Cooperation Movement by the Congress gave it a new energy and from January 1921 it began to register considerable success all over the country. Gandhiji undertook a nation-wide tour during which he addressed hundreds of meetings and met a large number of political workers. In the first month, thousands of students left their educational institutions and joined more than 800 national schools and colleges that had sprung up all over the country. Gandhiji had promised Swaraj within a year, if his programme was adopted.

The Non-Cooperation Movement demonstrated that it commanded the support and sympathy of vast sections of the Indian people. Its reach among many sections of Indian peasants, workers, artisans etc, had been demonstrated. The spatial spread of the movement was also nation-wide. Some areas were more active than others, but there were few that showed no signs of activity at all.

The capacity of the ''poor dumb millions'' of India to take part in modern nationalist politics was also demonstrated. This was the first time that nationalists from the towns, students from schools and colleges or even the educated and politically aware in the villages had made a serious attempt to bring the ideology and the movement into their midst.

The tremendous participation of different communities in the movement, and the maintenance of communal unity, despite the Malabar developments, was in itself no mean achievement. There is hardly any doubt that it was minority participation that gave the movement its truly mass character in many areas. And it was, indeed, unfortunate that this most positive feature of the movement was not to be repeated in later years once communalism began to take its toll.',
  'Extracted from India''s Struggle for Independence 1857–1947, by Bipin Chandra and Others, Penguin Books, 1989'
) ON CONFLICT (test_slug, passage_number) DO NOTHING;

-- Passage II: Sapiens (Prehistoric Humans)
INSERT INTO passages (test_slug, passage_number, title, text, source) VALUES (
  'clat-2026-english-sample',
  2,
  'Prehistoric Humans and Species',
  'There were humans long before there was history. The archaic humans loved, played, formed close friendships and competed for status and power, but so did chimpanzees, baboons and elephants. There was nothing special about them.

Nobody, least of all humans themselves, had any inkling that their descendants would one day walk on the moon, split the atom, fathom the genetic code and write history books. The most important thing to know about prehistoric humans is that they were incognisant animals with no more impact on their environment than gorillas, fireflies or jellyfish.

Biologists classify organisms into species. Animals are said to belong to the same species if they tend to mate with each other, giving birth to fertile offspring. Horses and donkeys have a recent common ancestor and share many physical traits. They will mate if induced to do so — but their offspring, called mules, are sterile. Mutations in donkey DNA can therefore never cross over to horses, or vice versa. The two types of animals are consequently considered two distinct species, moving along separate evolutionary paths.

By contrast, a bulldog and a spaniel may look very different, but they are members of the same species, sharing the same DNA pool.',
  'Extracted from Sapiens: A Brief History of Humankind by Yuval Noah Harari'
) ON CONFLICT (test_slug, passage_number) DO NOTHING;

-- Passage III: Animal Farm (Exploitation)
INSERT INTO passages (test_slug, passage_number, title, text, source) VALUES (
  'clat-2026-english-sample',
  3,
  'Animal Farm — Old Major''s Speech',
  'Man is the only creature that consumes without producing. He does not give milk, he does not lay eggs, he is too weak to pull the plough, and he cannot run fast enough to catch rabbits. Yet he claims dominion over all animals. He sets us to work, returns only the bare minimum to keep us from starving, and keeps the rest for himself. Our labour tills the soil, our dung fertilizes it, and still, not one of us owns more than our bare skin.

You cows, look at yourselves — how many thousands of gallons of milk have you produced this past year? And what has become of it, milk that should have nurtured strong calves? Every drop has gone down the throats of our enemies. And you hens, how many eggs have you laid, and how many of those ever hatched into chicks? The rest have gone to market to bring in money for Jones and his men. And you, Clover, where are the four foals you bore, who should have supported and comforted you in your old age? Each was sold at just a year old — you will never see them again.

Even the lives we do live are cut short, denied their natural span. I do not grumble, for I am among the fortunate. I am twelve years old and have borne over four hundred children. Such is the natural life of a pig. But no animal escapes the cruel knife in the end. You young porkers sitting before me, each of you will scream your lives out at the block within a year. This is the fate that awaits all of us — cows, pigs, hens, sheep, everyone. Even horses and dogs share no better end. Boxer, the very day your great muscles fail you, Jones will sell you to the knacker, who will slit your throat and boil you down for the foxhounds.',
  'Extracted with edits from George Orwell''s Animal Farm'
) ON CONFLICT (test_slug, passage_number) DO NOTHING;


-- ── Step 3: Insert questions linked to passages ───────────────────────────────
-- We reference passage IDs via a subquery.

-- PASSAGE I QUESTIONS (5 questions)

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 1,
  'From the passage it is evident that:',
  'The idea of Swaraj seemed futile',
  'The non-cooperation movement was a complete success',
  'The non-cooperation movement gained the sympathy of majority of the Indians',
  'The Indian National Congress represented microscopic minority',
  'C',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 1
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 2,
  'The term "poor dumb millions" refer to:',
  'The vast number of common people who are impoverished',
  'Large number of common people who are hearing impaired',
  'Large number of people who are vulnerable',
  'The vast number of people who are impoverished and uneducated',
  'A',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 1
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 3,
  'Which of the statements is true?',
  'The Swaraj movement happened before the non co-operation movement',
  'The non co-operation movement failed due to sudden withdrawal',
  'There was a fine show of communal unity in the movement',
  'The rich and the educated kept themselves away from the non co-operation movement',
  'C',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 1
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 4,
  'The main idea of the passage is:',
  'The non co-operation movement did not give impetus to the future movements',
  'The movement made the Indians realize their potential to fight against the mighty British',
  'The British became fearful and worried of Gandhiji''s leadership and co-operation of Indians',
  'That the most positive feature of the movement was that it was repeated in later years',
  'B',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 1
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 5,
  'The word "Communalism" in the above passage refers to:',
  'Religious identity',
  'Caste identity',
  'Regional identity',
  'Secularism',
  'A',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 1
ON CONFLICT DO NOTHING;

-- PASSAGE II QUESTIONS (5 questions)

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 6,
  'Which of the following can be inferred as the most significant characteristic of prehistoric humans, as per the passage?',
  'Their conscious effort to alter and shape their environment for survival',
  'Their complex social organization and clear hierarchical structures that set them apart from other species',
  'Their evolutionary divergence was marked by warfare and the pursuit of dominance over rival species',
  'Their inability to distinguish themselves from other species in terms of environmental impact',
  'D',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 2
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 7,
  'In the context of the passage, the term "incognisant" most likely means:',
  'Lacking intelligence',
  'Unaware of their future potential',
  'Incapable of social interaction',
  'Disinterested in the environment',
  'B',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 2
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 8,
  'Which of the following best explains why humans did not initially stand out among other organisms?',
  'They had fewer offspring than other species',
  'Their behaviours were not unique compared to other animals',
  'They did not yet evolve the ability to use tools',
  'They lacked the genetic capacity to develop language',
  'B',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 2
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 9,
  'According to the passage, what determines whether two animals belong to the same species?',
  'Their ability to produce fertile offspring',
  'Their physical appearance and size',
  'Their shared evolutionary ancestor',
  'Their capacity to adapt to the environment',
  'A',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 2
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 10,
  'The passage explains the concept of species classification by:',
  'Highlighting the behavioural differences between species like horses, donkeys, bulldogs and spaniels',
  'Focusing on the DNA pool they share',
  'Contrasting horses and donkeys vs bulldogs and spaniels to explain reproductive compatibility',
  'Discussing the environmental impact of different species',
  'C',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 2
ON CONFLICT DO NOTHING;

-- PASSAGE III QUESTIONS (5 questions)

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 11,
  'Which of the following best describes the tone of the passage?',
  'Detached and neutral',
  'Critical, somber, and resentful, evoking both awareness and outrage',
  'Humorous and light-hearted',
  'Admiring and celebratory',
  'B',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 3
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 12,
  'The speaker frequently contrasts animals'' work with human gain. This literary technique is best classified as:',
  'Allegory of class exploitation',
  'Hyperbole for comic effect',
  'Irony about farm management',
  'Metaphor for animal biology',
  'A',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 3
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 13,
  'Who is a "knacker"?',
  'A slaughterer',
  'A trader whose business is disposal of dead and unwanted animals',
  'A person whose business is disposal of dead or unwanted animals especially those whose flesh is not fit for human consumption',
  'A harness-maker',
  'C',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 3
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 14,
  'The repeated reference to slaughter, drowning, and the knacker in the passage primarily serves to:',
  'Provide a detailed account of animal husbandry',
  'Evoke emotional outrage and highlight the brutality of exploitation',
  'Suggest that animals are naturally subservient',
  'Indicate that humans value animals',
  'B',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 3
ON CONFLICT DO NOTHING;

INSERT INTO mock_test_questions (test_slug, question_number, question, option_a, option_b, option_c, option_d, correct_answer, subject, passage_id)
SELECT
  'clat-2026-english-sample', 15,
  'The claim "Man is the only creature that consumes without producing" is best understood as:',
  'A factual biological observation',
  'A rhetorical device to stir the animals into rebellion',
  'A scientific theory about human evolution',
  'An accurate economic analysis of farm output',
  'B',
  'English Language',
  p.id
FROM passages p WHERE p.test_slug = 'clat-2026-english-sample' AND p.passage_number = 3
ON CONFLICT DO NOTHING;


-- ── Step 4: Update question count ─────────────────────────────────────────────

UPDATE mock_tests
SET total_questions = (
  SELECT COUNT(*) FROM mock_test_questions WHERE test_slug = 'clat-2026-english-sample'
)
WHERE slug = 'clat-2026-english-sample';
