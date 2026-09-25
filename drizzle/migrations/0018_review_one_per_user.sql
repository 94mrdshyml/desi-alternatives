-- One review per signed-in user per tool. NULL user_id (legacy anonymous reviews) is not constrained.
CREATE UNIQUE INDEX IF NOT EXISTS `tool_reviews_user_tool_unique` ON `tool_reviews` (`user_id`, `tool_id`);
