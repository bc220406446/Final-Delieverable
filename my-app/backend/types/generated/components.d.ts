import type { Schema, Struct } from '@strapi/strapi';

export interface ContentCategoryCard extends Struct.ComponentSchema {
  collectionName: 'components_content_category_cards';
  info: {
    displayName: 'Category Card';
    icon: 'layer-group';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ContentFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_content_faq_items';
  info: {
    displayName: 'FAQ Item';
    icon: 'question-circle';
  };
  attributes: {
    answer: Schema.Attribute.Text;
    question: Schema.Attribute.String;
  };
}

export interface ContentProblemSolutionBlock extends Struct.ComponentSchema {
  collectionName: 'components_content_problem_solution_blocks';
  info: {
    displayName: 'Problem Solution Block';
    icon: 'exchange-alt';
  };
  attributes: {
    problem: Schema.Attribute.Text;
    solution: Schema.Attribute.Text;
  };
}

export interface ContentStepCard extends Struct.ComponentSchema {
  collectionName: 'components_content_step_cards';
  info: {
    displayName: 'Step Card';
    icon: 'list-ol';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    num: Schema.Attribute.Integer;
    title: Schema.Attribute.String;
  };
}

export interface ContentTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_content_team_members';
  info: {
    displayName: 'Team Member';
    icon: 'user';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
    role: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'content.category-card': ContentCategoryCard;
      'content.faq-item': ContentFaqItem;
      'content.problem-solution-block': ContentProblemSolutionBlock;
      'content.step-card': ContentStepCard;
      'content.team-member': ContentTeamMember;
    }
  }
}
