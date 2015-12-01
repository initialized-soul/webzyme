$(document).ready(function(){

	// create a new collection for sequence highlights
	var highlights = new Backbone.Collection();

	// Create a new Backbone model for the current sequence
	var sequence = new SequenceModel();

	// New well area for sequence properties
	new SequencePanelView({
		el: '#div_sequence_panel',
		model: sequence
	});

	// New textarea view for sequences
	new SequenceView({
		el: '#span_sequence',
		lineNumsLeftEl: 'span_sequence_positions_left',
		lineNumsRightEl: 'span_sequence_positions_right',
		model: sequence,
		collection: highlights
	});

	// New list view for sequence highlights
	new HighlightListView({
		el: '#ul_highlights',
		collection: highlights
	});

	// Initialize the sequence model
	sequence.set({
		name: '"Eukaryotic" Green Fluorescent Protein (eGFP)',
		sequence: 'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAA \
				GTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGC \
				TGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAG \
				CAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTA \
				CAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGG \
				ACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAAC \
				GGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACAC \
				CCCCATCGGCGACGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACG \
				AGAAGCGCGATCACATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAG'
	});
});