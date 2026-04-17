import { StepNode } from './StepNode';
import { AttachmentNode } from './AttachmentNode';

export const pipelineNodeTypes = {
    step: StepNode,
    attachment: AttachmentNode,
} as const;
