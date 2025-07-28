import json

with open('addresses.json', 'r') as f:
	add = json.load(f) # add = {name: [add, tin]}

with open('pvtaddresses.json', 'r') as f:
	padd = json.load(f)

for i, j in padd.items():
	add[j].append(i) # {name: [add, tin, pvt]}

a = {}
for name in sorted(add):
	a[name] = add[name]

with open('generated_gst_codes.csv', 'w') as f:
	i = 1
	for x, y in a.items():
		if len(y) == 2: # no, tin, pvt, name
			f.write('{},{},--,{}\n'.format(i, y[1], x))
		else:
			f.write('{},{},{},{}\n'.format(i, y[1], y[2], x))
		i += 1
