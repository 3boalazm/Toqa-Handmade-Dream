CREATE TABLE `wishes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`name` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishes_id` PRIMARY KEY(`id`)
);
