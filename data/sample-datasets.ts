export const SampleDatasets = [
  {
    name: 'Dataset A',
    providers: [
      {
        label: 'Provider A',
        href: 'https://www.provider-a.com',
      },
      {
        label: 'Provider B',
        label: 'https://www.provider-a.com',
      },
      {
        label: 'Provider C',
        href: 'https://www.provider-a.com',
      },
    ],
    description:
      'This is Dataset A. Lorem Ipsum is simply dummy text of the printing and typesetting industry. ',
    thumbnail: null,
    tags: ['tag1', 'tag2', 'tag3'],
    coverage: {
      temporal_coverage_start_date: '2022-01-01',
      temporal_coverage_end_date: '2022-12-31',
      geo_spatial_coverage: 'Global',
    },
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'dependabot-bot',
      },
    ],
    license: {
      name: 'MIT License',
      href: 'https://opensource.org/licenses/MIT',
    },
    links: [
      {
        label: 'Link to GitHub',
        href: 'https://www.link-a.com',
      },
      {
        label: 'Link to publication',
        href: 'https://www.link-b.com',
      },
    ],
    doi_citation: 'https://doi.org/10.1234/dataset-a',
    expected_update_frequency: 'Daily',
    demo: true,
  },
  {
    name: 'Dataset B',
    providers: [
      {
        label: 'Provider B',
        href: 'https://www.provider-b.com',
      },
    ],
    description:
      "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    thumbnail: null,
    tags: ['tag2', 'tag3'],
    coverage: null,
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'dependabot-bot',
      },
      {
        name: 'Maintainer B',
        github_username: 'octocat',
      },
    ],
    license: {
      label: 'MIT License',
      href: 'https://opensource.org/licenses/MIT',
    },
    links: [
      {
        label: 'Link B',
        href: 'https://www.link-b.com',
      },
    ],
    doi_citation: null,
    expected_update_frequency: null,
    demo: false,
  },

  {
    name: 'Dataset C',
    providers: [
      {
        label: 'Provider A',
        href: 'https://www.provider-a.com',
      },
      {
        label: 'Provider B',
        href: 'https://www.provider-b.com',
      },
    ],
    description: 'This is Dataset C.',
    thumbnail: null,
    tags: ['tag1', 'tag3'],
    coverage: null,
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'dependabot-bot',
      },
    ],
    license: {
      label: 'Apache License 2.0',
      href: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    links: [
      {
        label: 'Link A',
        href: 'https://www.link-a.com',
      },
      {
        label: 'Link B',
        href: 'https://www.link-b.com',
      },
    ],
    doi_citation: 'https://doi.org/10.1234/dataset-c',
    expected_update_frequency: 'Monthly',
    demo: true,
  },
  {
    name: 'Dataset D',
    providers: [
      {
        label: 'Provider B',
        href: 'https://www.provider-b.com',
      },
    ],
    description: 'This is Dataset D.',
    thumbnail: null,
    tags: ['tag2', 'tag3'],
    coverage: {
      temporal_coverage_start_date: '2023-01-01',
      temporal_coverage_end_date: '2023-12-31',
      geo_spatial_coverage: 'USA',
    },
    maintainers: [
      {
        name: 'Maintainer B',
        github_username: 'octocat',
      },
    ],
    license: null,
    links: [
      {
        label: 'Link B',
        href: 'https://www.link-b.com',
      },
    ],
    doi_citation: null,
    expected_update_frequency: null,
    demo: true,
  },
  {
    name: 'Dataset E',
    providers: [
      {
        label: 'Provider A',
        href: 'https://www.provider-a.com',
      },
    ],
    description: 'This is Dataset E.',
    thumbnail: null,
    tags: ['tag1', 'tag2', 'tag3'],
    coverage: null,
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'dependabot-bot',
      },
      {
        name: 'Maintainer B',
        github_username: 'octocat',
      },
    ],
    license: {
      label: 'Apache License 2.0',
      href: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    links: [],
    doi_citation: 'https://doi.org/10.1234/dataset-e',
    expected_update_frequency: null,
    demo: false,
  },
]
