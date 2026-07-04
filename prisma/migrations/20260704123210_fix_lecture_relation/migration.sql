/*
  Warnings:

  - You are about to drop the column `courseId` on the `StudyPlanCourse` table. All the data in the column will be lost.
  - Added the required column `room` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleId` to the `StudyPlanCourse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_lectureId_fkey`;

-- DropForeignKey
ALTER TABLE `StudyPlanCourse` DROP FOREIGN KEY `StudyPlanCourse_courseId_fkey`;

-- AlterTable
ALTER TABLE `Course` MODIFY `lectureId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `capacity` INTEGER NOT NULL DEFAULT 35,
    ADD COLUMN `room` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `StudyPlanCourse` DROP COLUMN `courseId`,
    ADD COLUMN `scheduleId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_lectureId_fkey` FOREIGN KEY (`lectureId`) REFERENCES `Lecture`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudyPlanCourse` ADD CONSTRAINT `StudyPlanCourse_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
